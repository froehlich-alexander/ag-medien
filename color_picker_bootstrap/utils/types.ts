import * as React from "react";

interface DefaultProps {
    className?: string,
}

type FunctionComponent<P extends { [k: string]: any }> =
    React.FunctionComponent<(P extends { "children": any } ? P : React.PropsWithChildren<P>)>;
type ComponentProps<T extends React.Component | React.ComponentType> = T extends React.Component<infer P> | React.ComponentType<infer P>
    ? JSX.LibraryManagedAttributes<T, P>
    : never;
export {ComponentProps};
export {FunctionComponent};
export {DefaultProps};