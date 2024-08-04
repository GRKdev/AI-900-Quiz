export const QuizSkeleton = () => {
    return (
        <div className="mb-4 flex flex-col gap-4 text-sm">
            <div className="rounded-lg bg-zinc-800 p-4">
                <div className="text-sm font-bold text-zinc-500 text-right mb-1">
                    <div className="h-4 w-14 ml-auto rounded bg-zinc-700"></div>
                </div>
                <div className="mb-4 h-8 w-3/4 rounded bg-zinc-700"></div>
                <div className="flex flex-col gap-2">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="rounded-md p-2 bg-zinc-700">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-full rounded bg-zinc-700"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};