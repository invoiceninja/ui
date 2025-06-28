import Timeline from './timeline';
import classNames from 'classnames';


export interface TimelineItemType {
    id: number;
    title: string;
    description?: string;
    time: string;
    completed: boolean;
    status: string;
}

interface TimelineLayoutProps {
    items: TimelineItemType[];
}

export function TimelineLayout({ items }: TimelineLayoutProps) {
    return (
        <div className={classNames("relative")}>
            {items.map((item, index) => (
                <Timeline
                    key={item.id}
                    item={item}
                    nextItemCompleted={items[index + 1]?.completed}
                />
            ))}
        </div>
    );
}