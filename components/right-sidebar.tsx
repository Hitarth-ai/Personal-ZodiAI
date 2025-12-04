"use client";

import { X } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { CAPABILITIES } from "@/config/capabilities";

interface RightSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onCapabilityClick: (capability: string) => void;
    theme: {
        sidebar: string;
        text: string;
    };
}

export function RightSidebar({ isOpen, onClose, onCapabilityClick, theme }: RightSidebarProps) {
    return (
        <>
            {/* MOBILE OVERLAY */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed inset-y-0 right-0 z-30 w-80 flex flex-col border-l border-white/40 text-white transition-all duration-[1500ms] ease-in-out md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "translate-x-full md:w-0 md:border-l-0 md:overflow-hidden"
                    }`}
                style={{ backgroundColor: theme.sidebar }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/20">
                    <h2 className="font-semibold text-lg">ZodiAI Capabilities:</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/80 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <Accordion type="single" collapsible className="w-full">
                        {CAPABILITIES.map((cap, index) => (
                            <AccordionItem
                                key={index}
                                value={`item-${index}`}
                                className="border-white/20"
                            >
                                <AccordionTrigger className="text-sm hover:no-underline hover:bg-white/5 px-2 rounded-md">
                                    {cap.title}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-1 px-2 pt-2">
                                        {cap.items.map((item, idx) => (
                                            <li key={idx}>
                                                <button
                                                    onClick={() => onCapabilityClick(item)}
                                                    className="w-full text-left text-xs opacity-80 hover:opacity-100 hover:bg-white/10 px-2 py-1.5 rounded transition-colors"
                                                >
                                                    {item}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </aside>
        </>
    );
}
