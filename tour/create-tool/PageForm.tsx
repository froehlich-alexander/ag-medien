import React from "react";
import {DefaultProps} from "./utils";

interface PageFormProps extends DefaultProps {

}

export default function PageForm(
    {
        className,
    }: PageFormProps,
) {
    return (
        <div className={className}>
            <form>

            </form>
        </div>
    );
};
