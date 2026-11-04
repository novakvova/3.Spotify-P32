import React, { useState } from 'react';
import arrow from '../assets/home/arrow.svg';

interface FAQItem {
    question: string;
    answer?: string;
}

interface FAQProps {
    items: FAQItem[];
}

export const FAQ: React.FC<FAQProps> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <section className="py-16 px-4 bg-white text-black max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Маєте запитання?</h2>
            <div className="space-y-4">
                {items.map((item, index) => {
                    const isOpen = openIndex === index;
                    return (
                        <div key={index} className="border-b border-gray-200 pb-4">
                            <button
                                className="w-full flex justify-between items-center text-left text-lg font-medium py-2 focus:outline-none cursor-pointer"
                                onClick={() => setOpenIndex(isOpen ? null : index)}
                            >
                                <span>{item.question}</span>
                                <img
                                    src={arrow}
                                    alt="стрілочка"
                                    className={`w-25px h-10px transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                                />
                            </button>
                            {isOpen && (
                                <p className="mt-2 text-gray-600 text-sm">
                                    {item.answer || "Детальну інформацію про умови використання та параметри підписки ви можете знайти у розділі підтримки."}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};