export interface DefaultProps {
    className?: string,
}

export function fileSizeUnit(size: number, char: string, use1024: boolean, spacing = true): string {
    return size.toFixed(2).replaceAll(/\.?0*$/g, '') +
        (spacing ? ' ' : '') + char.toUpperCase() + (use1024 ? 'i' : '') + 'B';
}

export function formatFileSize(size: number, use1024: boolean = true): string {
    const kilobyte = use1024 ? 1024 : 1000;

    if (size >= kilobyte ** 8) {
        return fileSizeUnit(size / kilobyte ** 8, 'y', use1024);
    }
    if (size >= kilobyte ** 7) {
        return fileSizeUnit(size / kilobyte ** 7, 'z', use1024);
    }
    if (size >= kilobyte ** 6) {
        return fileSizeUnit(size / kilobyte ** 6, 'e', use1024);
    }
    if (size >= kilobyte ** 5) {
        return fileSizeUnit(size / kilobyte ** 5, 'p', use1024);
    }
    if (size >= kilobyte ** 4) {
        return fileSizeUnit(size / kilobyte ** 4, 't', use1024);
    }
    if (size >= kilobyte ** 3) {
        return fileSizeUnit(size / kilobyte ** 3, 'g', use1024);
    }
    if (size >= kilobyte ** 2) {
        return fileSizeUnit(size / kilobyte ** 2, 'm', use1024);
    }
    if (size >= kilobyte) {
        return fileSizeUnit(size, 'k', use1024);
    }
    return size + ' Bytes';
}
