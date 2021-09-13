export class StringUtil {
    private constructor() {
        // Prevent instantiation
    }

    public static kebabToSnakeCase(text: string): string {
        return text.replace("-", "").toUpperCase();
    }
}
