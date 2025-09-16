import csv
import json
import os
import re

def extract_pure_json_content():
    """从CSV文件中提取纯净的JSON内容"""
    # 使用相对路径指向同目录下的 CSV 文件
    file_path = os.path.join(os.path.dirname(__file__), "result.csv")
    
    # 读取 CSV
    results = []
    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        print("CSV 字段：", reader.fieldnames)
        
        for idx, row in enumerate(reader, start=1):
            try:
                raw_val = row["生成结果"]
                if not raw_val or raw_val.strip() == "":
                    print(f"{idx}. [WARN] 空值跳过")
                    continue
                    
                # 1. 去掉开头/结尾的多余引号
                cleaned = raw_val.strip().strip('"').strip("'")
                
                # 2. 解析外层JSON
                outer_data = json.loads(cleaned)
                
                # 3. 提取text字段中的内容
                text_content = outer_data.get("text", "")
                
                # 4. 提取 ```json 后面的 JSON 内容
                match = re.search(r'```json\s*({.*})\s*```', text_content, re.DOTALL)
                if match:
                    json_content = match.group(1)
                else:
                    # 如果没有找到 ```json 标记，尝试直接解析整个内容
                    json_content = text_content
                
                # 5. 转换为 JSON
                data = json.loads(json_content)
                results.append(data)
                print(f"{idx}. [SUCCESS] 解析成功 - {data.get('destination', 'Unknown')}")
            except json.JSONDecodeError as e:
                print(f"{idx}. [ERROR] JSON解析失败: {e}")
                print("原始数据:", raw_val[:100], "...")
            except Exception as e:
                print(f"{idx}. [ERROR] 其他错误: {e}")
                print("原始数据:", raw_val[:100], "...")

    # 输出解析成功的总数
    print(f"\n总共解析成功 {len(results)} 条记录")
    
    # 保存解析后的数据，只保留提取的纯净JSON内容
    if results:
        output_file = os.path.join(os.path.dirname(__file__), "pure_data.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"纯净数据已保存到: {output_file}")
        
        # 验证保存的数据
        print("\n验证保存的数据:")
        for i, result in enumerate(results[:3]):  # 只显示前3个
            if 'destination' in result:
                print(f"  {i+1}. {result['destination']}")
                
    return results

if __name__ == "__main__":
    extract_pure_json_content()