/**
 * Returns a promise which resolves after a defined time in ms
 * Usage: await delay(100);
 * @param delayInMs delay given in milliseconds
 */
export default async function delay(delayInMs: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(resolve, delayInMs);
    });
}
