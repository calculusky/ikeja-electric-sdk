export {};

declare global {
    type Optional<T, Key extends keyof T> = Omit<T, Key> & Partial<T>;
}
