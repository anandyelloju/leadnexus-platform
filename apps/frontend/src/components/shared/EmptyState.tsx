interface Props {
    title: string;
}

export default function EmptyState({
    title,
}: Props) {
    return (
        <div className="rounded-lg border p-10 text-center">
            <p className="text-gray-500">
                {title}
            </p>
        </div>
    );
}