export class TempStorage {
    private static storage = browser.storage.local;
    private static storageKey = "ignored-names";
    private static toggleKey = "toggle";

    public static async toggleHide(value: boolean): Promise<void> {
        await this.storage.set({ [this.toggleKey]: value });
    }

    public static async getHide(): Promise<boolean> {
        const a = await this.storage.get(this.toggleKey) as unknown as boolean;
        return a;
    }

    public static async addName(name: string): Promise<void> {
        await this.modifyNamesSet(names => names.add(name));
    }

    public static async removeName(name: string): Promise<void> {
        await this.modifyNamesSet(names => {
            names.delete(name);
            return names;
        });
    }

    public static async clear(): Promise<void> {
        await this.storage.remove(this.storageKey);
    }

    private static async modifyNamesSet(modification: (names: Set<string>) => Set<string>): Promise<void> {
        const names = await this.storage.get(this.storageKey) as Set<string>;
        await this.storage.set({ [this.storageKey]: modification(names) });
    }
}
