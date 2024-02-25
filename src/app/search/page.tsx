'use client'

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/navbar/navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import axios from 'axios';

function Page() {
    const [input, setInput] = useState("");
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let interval;
        if (loading && progress < 60) {
            interval = setInterval(() => {
                setProgress((currentProgress) => currentProgress + 1);
            }, 1000);
        } else if (!loading && progress !== 0) {
            setProgress(60);
            setTimeout(() => {
                setProgress(0); // Reset progress after data is fetched
            }, 1000); // Delay to show full progress bar for a short time
        }

        return () => {
            clearInterval(interval);
        };
    }, [loading, progress]);

    const handleButtonClick = async () => {
        setLoading(true);
        console.log(input);
        setInput("");

        try {
            const { data } = await axios.post("/api/userjoindate", { username: input });
            console.log(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    };

    const progressStyle = {
        width: `${progress * 3.3}%`, // Convert progress number to percentage
        backgroundColor: progress < 60 ? 'gray' : 'green', // Color changes when progress is complete
        height: '5px',
        transition: 'width 1s ease-in-out'
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Navbar />
            <div className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <h1 className="text-center text-4xl font-bold mb-6">
                        Enter your GitHub Username
                    </h1>
                    <div className="flex flex-col space-y-4">
                        <Input
                            placeholder="GitHub Username"
                            className="border-2 border-gray-300 bg-white p-2 rounded-lg text-lg focus:ring-2 focus:ring-black focus:border-transparent"
                            aria-label="GitHub Username"
                            onChange={(e) => setInput(e.target.value)}
                            value={input}
                        />
                        <Button
                            className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ease-in-out"
                            onClick={handleButtonClick}
                        >
                            Search
                        </Button>
                        {loading && (
                            <div className="relative w-full bg-gray-200 rounded">
                                <div style={progressStyle} className="bg-blue-500 rounded h-2"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;
