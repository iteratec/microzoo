export class StringUtil {
    private constructor() {
        // Prevent instantiation
    }

    public static toId(name: string): string {
        return name.replace(" ", "_");
    }

    public static kebabToSnakeCase(text: string): string {
        return text.replace("-", "").toUpperCase();
    }
}
