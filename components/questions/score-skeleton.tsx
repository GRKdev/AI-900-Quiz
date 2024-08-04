export function ScoreSkeleton() {
    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="mb-4 h-6 w-1/3 rounded bg-zinc-700"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="mb-2 h-4 w-24 rounded bg-zinc-700"></div>
                        <div className="h-8 w-16 rounded bg-zinc-700"></div>
                    </div>
                    <div>
                        <div className="mb-2 h-4 w-24 rounded bg-zinc-700"></div>
                        <div className="h-8 w-16 rounded bg-zinc-700"></div>
                    </div>
                    <div>
                        <div className="mb-2 h-4 w-24 rounded bg-zinc-700"></div>
                        <div className="h-8 w-16 rounded bg-zinc-700"></div>
                    </div>
                    <div>
                        <div className="mb-2 h-4 w-24 rounded bg-zinc-700"></div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-16 rounded bg-zinc-700"></div>
                            <div className="size-6 rounded-full bg-zinc-700"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
