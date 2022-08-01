function concatClass(...className: (string | false | undefined)[]): string | undefined {
    return className.filter(v => v).join(" ") ?? undefined;
}

function saveToFile(content: string, filename: string, mimeType: string, anchor: HTMLAnchorElement) {
    const blob = new Blob([content], {
        type: mimeType,
        endings: "native",
    });
    if (anchor.href) {
        URL.revokeObjectURL(anchor.href);
    }
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;

    anchor.click();
}

export {saveToFile};
export {concatClass};