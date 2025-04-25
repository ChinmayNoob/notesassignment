import { Poppins } from "next/font/google";
import { FaRegNoteSticky } from "react-icons/fa6";


import { cn } from "@/lib/utils";

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"],
});

interface HeaderProps {
    label: string;
}

export const Header = ({ label }: HeaderProps) => {
    return (
        <div className="w-full flex flex-col gap-y-4 items-center">
            <h1 className={cn(
                "text-3xl font-semibold flex gap-2 items-center",
                font.className,
            )}>
                <FaRegNoteSticky />
                Crollo
            </h1>
            <p className="text-muted-foreground text-sm">
                {label}
            </p>
        </div>
    )

}