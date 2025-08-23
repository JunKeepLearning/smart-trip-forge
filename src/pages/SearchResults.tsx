import React, { useState, useMemo, useEffect } from 'react';
import { useUI } from '@/contexts/UIContext';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import DetailDrawer from '@/components/DetailDrawer';
import { useExploreData } from '@/hooks/useExploreData';
import { useMyData } from '@/hooks/useMyData';
import { Destination, Spot, Route as RouteType } from '@/lib/api';
import ResultCard from '@/components/ResultCard';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext } from '@/components/ui/pagination';
import { ArrowLeft } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') as 'destination' | 'spot' | 'route' | null;
  const [searchQuery, setSearchQuery] = useState(query);
  const [currentPage, setCurrentPage] = useState(1);
  const { openDrawer } = useUI();

  const { data: recommendedData, loading: loadingRecommended } = useExploreData();
  const { data: myData, loading: loadingMy } = useMyData();

  const isSearchMode = query.length > 0;

  // --- Data & Logic for Search Mode ---
  const filterItems = (items: (Destination | Spot | RouteType)[], q: string) => {
    if (!items) return [];
    const lowerCaseQuery = q.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(lowerCaseQuery) || 
      item.description.toLowerCase().includes(lowerCaseQuery)
    );
  }
  const filteredRecommended = useMemo(() => filterItems(recommendedData ? [...recommendedData.destinations, ...recommendedData.routes, ...recommendedData.spots] : [], query), [recommendedData, query]);
  const filteredMy = useMemo(() => filterItems(myData?.myFavorites, query), [myData, query]);

  // --- Data & Logic for List Mode ---
  const singleTypeData = useMemo(() => {
    if (isSearchMode || !recommendedData || !type) return [];
    if (type === 'destination') return recommendedData.destinations;
    if (type === 'spot') return recommendedData.spots;
    if (type === 'route') return recommendedData.routes;
    return [];
  }, [isSearchMode, recommendedData, type]);

  const totalPages = Math.ceil(singleTypeData.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return singleTypeData.slice(start, end);
  }, [singleTypeData, currentPage]);


  const handleSearch = () => {
    setCurrentPage(1);
    setSearchParams({ q: searchQuery });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleCardClick = (item: Destination | Spot | RouteType) => {
    let itemType: 'destination' | 'route' | 'spot' = 'destination';
    if ('startCity' in item) itemType = 'route';
    if ('category' in item) itemType = 'spot';
    openDrawer(item, itemType);
  };

  const handleBack = () => {
    // If the user was navigated to this page, go back. Otherwise, go to explore.
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/explore');
    }
  };

  const renderSearchMode = () => (
    <div className="space-y-8">
      {filteredRecommended.length > 0 && renderSection('Recommended', filteredRecommended, 'recommended')}
      {filteredMy.length > 0 && renderSection('My Favorites', filteredMy, 'my')}
      {filteredRecommended.length === 0 && filteredMy.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">No results found for "{query}"</h2>
          <p className="text-muted-foreground mt-2">Try searching for something else.</p>
        </div>
      )}
    </div>
  );

  const renderSection = (title: string, items: (Destination | Spot | RouteType)[], scope: 'recommended' | 'my') => (
    <section>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="space-y-3">
        {items.slice(0, 5).map(item => (
          <ResultCard key={`${scope}-${item.id}`} item={item} highlight={query} onClick={() => handleCardClick(item)} />
        ))}
      </div>
      {items.length > 5 && (
        <div className="text-center mt-4">
          <Button variant="ghost" onClick={() => navigate(`/search?q=${query}&scope=${scope}`)}>
            View More
          </Button>
        </div>
      )}
    </section>
  );

  const renderListMode = () => (
    <section>
        <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Back</span>
            </Button>
            <h1 className="text-3xl font-bold">
                {`All ${type ? type.charAt(0).toUpperCase() + type.slice(1) : ''}s`}
            </h1>
        </div>
      <div className="space-y-3">
        {paginatedData.map(item => (
          <ResultCard key={item.id} item={item} highlight={query} onClick={() => handleCardClick(item)} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(Math.max(1, currentPage - 1)); }} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(i + 1); }} isActive={currentPage === i + 1}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(Math.min(totalPages, currentPage + 1)); }} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </section>
  );

  return (
    <>
      <main className="flex-grow">
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
        />
        <div className="container mx-auto px-4 py-8">
          {loadingRecommended || loadingMy ? (
            <p>Loading...</p> // Simple loading state for now
          ) : isSearchMode ? (
            renderSearchMode()
          ) : (
            renderListMode()
          )}
        </div>
      </main>
      <DetailDrawer />
    </>
  );
};

export default SearchResults;
