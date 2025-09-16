-- 城市表
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,             -- 方便 URL / SEO
    country TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 旅行主表
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,        -- 关联用户
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,              -- 选择开始日期
    end_date DATE,                -- 结束日期
    days_count INT,               -- 或者直接输入天数
    tags TEXT[],                 -- 标签数组
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 确保结束日期不早于开始日期
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- 每一天
CREATE TABLE trip_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_index INT NOT NULL,       -- 第几天（1,2,3...）
    date DATE,                    -- 如果有 start_date/end_date，可以存实际日期
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trip_id, day_index),   -- 保证同一行程中 day_index 不重复
    UNIQUE(trip_id, date)         -- 保证同一行程中 date 不重复
);

-- 景点/地点表
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,             -- 方便 URL / SEO
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,                 -- 可以关联城市表（如果有）
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 每一天的行程条目
CREATE TABLE trip_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_day_id UUID REFERENCES trip_days(id) ON DELETE CASCADE, -- 如果分配了某一天
    place_id UUID REFERENCES places(id), -- 如果是数据库里的景点
    custom_place_name TEXT,              -- 如果用户自定义地点
    order_index INT NOT NULL,            -- 当天的顺序（1,2,3...）
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 检查约束：直接使用 custom_place_name 判断
    CONSTRAINT trip_items_place_check CHECK (
        (custom_place_name IS NOT NULL AND place_id IS NULL) OR
        (place_id IS NOT NULL AND custom_place_name IS NULL)
    )
);

-- 部分唯一索引：确保只有分配了 day 的 items 才受顺序唯一性约束
CREATE UNIQUE INDEX ux_trip_items_day_order ON trip_items(trip_day_id, order_index) WHERE trip_day_id IS NOT NULL;

-- 交通方式表（描述两个 trip_item 之间的交通方式）
CREATE TABLE trip_item_transports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_item_id UUID NOT NULL REFERENCES trip_items(id) ON DELETE CASCADE,
    to_item_id UUID NOT NULL REFERENCES trip_items(id) ON DELETE CASCADE,
    transport_mode TEXT NOT NULL,       -- bus, metro, car, walk...
    duration_minutes INT,               -- 耗时
    distance_km NUMERIC,                -- 距离
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- 防止重复记录
    CONSTRAINT trip_item_transports_unique UNIQUE (from_item_id, to_item_id),

    -- 防止自己指向自己并强制 from_id < to_id
    CONSTRAINT trip_item_transports_no_self CHECK (from_item_id <> to_item_id),
    CONSTRAINT trip_item_transports_ordered CHECK (from_item_id < to_item_id)
);

-- 添加索引以提高查询性能
CREATE INDEX idx_trips_created_at ON trips(created_at);
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trip_items_place_id ON trip_items(place_id);
CREATE INDEX idx_cities_slug ON cities(slug);
CREATE INDEX idx_places_city_id ON places(city_id);

-- 添加行级安全策略
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_item_transports ENABLE ROW LEVEL SECURITY;

-- 为 cities 表添加 RLS 策略 (允许所有人读取城市信息)
CREATE POLICY "Everyone can read cities" ON cities
    FOR SELECT USING (true);

-- 为 trips 表添加 RLS 策略
CREATE POLICY "Users can only access their own trips" ON trips
    FOR ALL USING (auth.uid() = user_id);

-- 为 trip_days 表添加 RLS 策略
CREATE POLICY "Users can only access trip days from their own trips" ON trip_days
    FOR ALL USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

-- 为 trip_items 表添加 RLS 策略
CREATE POLICY "Users can only access trip items from their own trips" ON trip_items
    FOR ALL USING (trip_day_id IN (SELECT id FROM trip_days WHERE trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())));

-- 为 trip_item_transports 表添加 RLS 策略
CREATE POLICY "Users can only access trip item transports from their own trips" ON trip_item_transports
    FOR ALL USING (from_item_id IN (SELECT id FROM trip_items WHERE trip_day_id IN (SELECT id FROM trip_days WHERE trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()))));

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为所有需要的表添加触发器
CREATE TRIGGER update_cities_updated_at 
    BEFORE UPDATE ON cities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trips_updated_at 
    BEFORE UPDATE ON trips 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trip_days_updated_at 
    BEFORE UPDATE ON trip_days 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_places_updated_at 
    BEFORE UPDATE ON places 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trip_items_updated_at 
    BEFORE UPDATE ON trip_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trip_item_transports_updated_at 
    BEFORE UPDATE ON trip_item_transports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();