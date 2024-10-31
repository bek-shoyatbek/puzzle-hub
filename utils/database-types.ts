export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    username: string
                    email: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    username: string
                    email: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    updated_at?: string
                }
            }
            leaderboard: {
                Row: {
                    id: string
                    user_id: string
                    grid_size: string
                    moves: number
                    time_seconds: number
                    completed_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    grid_size: string
                    moves: number
                    time_seconds: number
                    completed_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    grid_size?: string
                    moves?: number
                    time_seconds?: number
                    completed_at?: string
                }
            }
        }
        Views: {
            leaderboard_view: {
                Row: {
                    id: string
                    username: string
                    grid_size: string
                    moves: number
                    time_seconds: number
                    completed_at: string
                }
            }
        }
    }
}