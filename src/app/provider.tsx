"use client";
import { Provider } from "react-redux";
import { store } from "@/store/store"
import React from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { App, ConfigProvider } from "antd";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 5,
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
})

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
                <ConfigProvider theme={{ token: { colorPrimary: "#16796f", borderRadius: 8, fontFamily: "var(--font-geist-sans), sans-serif" } }}>
                    <App>
                        <AuthProvider>
                            <SocketProvider>{children}</SocketProvider>
                        </AuthProvider>
                    </App>
                </ConfigProvider>
            </Provider>
            <ReactQueryDevtools initialIsOpen={false}/>
        </QueryClientProvider>
    )
}

