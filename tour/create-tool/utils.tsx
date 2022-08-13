import classNames from "classnames";
import {cssNumber} from "jquery";
import React from "react";

type MAXIMUM_ALLOWED_BOUNDARY = 999
type MAXIMUM_NUMBER_RANGE = NumberRangeArray<MAXIMUM_ALLOWED_BOUNDARY>[number] | MAXIMUM_ALLOWED_BOUNDARY;

type NumberRangeArray<N extends number, Result extends Array<number> = []> = (
    Result["length"] extends N
        ? Result
        : NumberRangeArray<N, [...Result, Result["length"]]>
    );

/**
 * Returns a number range type<br>
 * Bsp: {@link NumberRange}<3> returns 0 | 1 | 2
 */
// @ts-ignore
export type NumberRange<N extends MAXIMUM_NUMBER_RANGE> = NumberRangeArray<N>[number];
// N extends (NumberRangeArray<MAXIMUM_ALLOWED_BOUNDARY>[number] | MAXIMUM_ALLOWED_BOUNDARY)
//     ? (NumberRangeArray<N> [number])
//     : never
// );

type UnFlatArrayRecursive<LastT, Depth extends MAXIMUM_NUMBER_RANGE, DepthArray extends Array<unknown>> =
    (DepthArray[Depth] extends undefined
        ? UnFlatArrayRecursive<Array<LastT>, Depth, [...DepthArray, Array<LastT>]>
        : DepthArray[number]);

/**
 * Opposite of {@link FlatArray}<br>
 * Depth 0 means T; Depth 1 means T | T[]; and so on
 */
export type UnFlatArray<T, Depth extends MAXIMUM_NUMBER_RANGE = 2, ExcludeMainType extends boolean = true> =
    UnFlatArrayRecursive<T, Depth, [(ExcludeMainType extends true ? never : T)]>;

export interface DefaultProps {
    className?: string,
}

export function arrayIsValid<T>(array: Array<T>|undefined): array is Array<T>&{length: Exclude<number, 0>} {
    return array !== undefined && array.length !== 0;
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

type MaterialIconProps = {
    outlined?: boolean,
    round?: boolean,
    sharp?: boolean,
    twoTone?: boolean,
    color?: "danger" | "primary" | "secondary" | "info" | "dark" | "black" | "light",
} & ({ children?: JSX.Element, icon: string } | { children: string, icon?: string }) & React.HTMLProps<HTMLSpanElement>;

export function MaterialIcon({outlined, round, sharp, twoTone, icon, color, children, ...props}: MaterialIconProps) {
    let style;
    if (outlined) {
        style = 'outlined';
    } else if (round) {
        style = 'round';
    } else if (sharp) {
        style = 'sharp';
    } else if (twoTone) {
        style = 'two-tone';
    }
    return <span className={classNames("material-icons" + (style ? ('-' + style) : ''), color && "text-" + color)}
                 {...props}>
        {icon}
        {children}
    </span>;
}

