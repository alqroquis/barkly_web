import React, { useState, useEffect } from "react";
import { AsyncTypeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";

export const BreedSearch = ({ value, onChange }) => {
    const [breeds, setBreeds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBreed, setSelectedBreed] = useState(value || []);

    useEffect(() => {
        setSelectedBreed(value || []);
    }, [value]);


    useEffect(() => {
        fetch(`/api/search/breeds`, { method: "GET", credentials: "include" }).then((response) => {
            return response.json();
        }).then((data) => {
            setBreeds(data.breeds);
            setPage(1);
            setHasMore(data.totalCount > data.breeds?.length);
        });
    }, []);


    const handleSearch = async (query) => {
        setIsLoading(true);
        setSearchQuery(query);
        try {
            const response = await fetch(`/api/search/breeds?query=${query}&page=1`, { method: "GET", credentials: "include" });
            const data = await response.json();
            setBreeds(data.breeds);
            setPage(1);
            setHasMore(data.totalCount > data.breeds?.length);
        } catch (error) {
            console.error("Ошибка при поиске пород:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleLoadMore = async () => {
        if (!hasMore || isLoading) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/search/breeds?query=${searchQuery}&page=${page + 1}`, { method: "GET", credentials: "include" });
            const data = await response.json();
            console.log(data.breeds);
            setBreeds((prevBreeds) => [...prevBreeds, ...data.breeds]);
            setPage((prevPage) => prevPage + 1);
            setHasMore(data?.totalCount > breeds?.length + data.breeds?.length);
        } catch (error) {
            console.error("Ошибка при загрузке пород:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleScroll = (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        if (scrollHeight - scrollTop === clientHeight && hasMore && !isLoading) {
            handleLoadMore();
        }
    };


    return (
        <AsyncTypeahead
            id="breed-search"
            placeholder="Введите породу"
            isLoading={isLoading}
            options={breeds}
            onSearch={handleSearch}
            onChange={(selected) => {
                setSelectedBreed(selected);
                onChange(selected);
            }}
            onInputChange={(text) => handleSearch(text)}
            selected={selectedBreed}
            labelKey="name"
            renderMenuItemChildren={(option) => <div>{option.name}</div>}
            onScroll={handleScroll}
            defaultInputValue={selectedBreed[0]?.name}
        />
    );
};


export const FeedTypeSearch = ({ value, onChange }) => {
    const [feedTypes, setFeedTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFeedType, setSelectedFeedType] = useState(value || []);

    useEffect(() => {
        setIsLoading(true);
        fetch(`/api/search/feed-types`, { method: "GET", credentials: "include" }).then((response) => {
            return response.json();
        }).then((data) => {
            setFeedTypes(data.feedTypes);
            setPage(1);
            setHasMore(data.totalCount > data.feedTypes?.length);
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        setSelectedFeedType(value || []);
    }, [value]);

    const handleSearch = async (query) => {
        setIsLoading(true);
        setSearchQuery(query);
        try {
            const response = await fetch(`/api/search/feed-types?query=${query}&page=1`, { method: "GET", credentials: "include" });
            const data = await response.json();
            setFeedTypes(data.feedTypes);
            setPage(1);
            setHasMore(data.totalCount > data.feedTypes?.length);
        } catch (error) {
            console.error("Ошибка при поиске пород:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleLoadMore = async () => {
        if (!hasMore || isLoading) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/search/feed-types?query=${searchQuery}&page=${page + 1}`, { method: "GET", credentials: "include" });
            const data = await response.json();
            setFeedTypes((prevTypes) => [...prevTypes, ...data.feedTypes]);
            setPage((prevPage) => prevPage + 1);
            setHasMore(data?.totalCount > feedTypes?.length + data.feedTypes?.length);
        } catch (error) {
            console.error("Ошибка при загрузке пород:", error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleScroll = (event) => {
        const { scrollTop, scrollHeight, clientHeight } = event.target;
        if (scrollHeight - scrollTop === clientHeight && hasMore && !isLoading) {
            handleLoadMore();
        }
    };


    return (
        <AsyncTypeahead
            id="feed-search"
            placeholder="Введите тип корма"
            isLoading={isLoading}
            options={feedTypes}
            onSearch={handleSearch}
            onChange={(selected) => {
                setSelectedFeedType(selected);
                onChange(selected);
            }}
            onInputChange={(text) => handleSearch(text)}
            selected={selectedFeedType}
            labelKey="name"
            renderMenuItemChildren={(option) => <div>{option.name}</div>}
            onScroll={handleScroll}
            defaultInputValue={selectedFeedType[0]?.name}
        />
    );
};