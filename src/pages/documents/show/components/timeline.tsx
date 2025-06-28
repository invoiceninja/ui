import type { TimelineItemType } from "./timeline-layout"
import { MdCheck, MdAccessTime } from "react-icons/md"

interface PropsType {
    item: TimelineItemType
    nextItemCompleted?: boolean
}

const Timeline: React.FC<PropsType> = ({ item, nextItemCompleted }) => {
    return (
        <div className="group relative py-6 pl-8 sm:pl-32">
            <div className={`mb-1 flex flex-col items-start before:absolute before:left-4 before:h-full before:-translate-x-1/2 before:translate-y-3 before:self-start ${nextItemCompleted ? 'before:bg-slate-300' : 'before:border-l before:border-dashed before:border-slate-300'} before:px-px after:absolute after:left-4 after:box-content after:h-2 after:w-2 after:-translate-x-1/2 after:translate-y-1.5 after:rounded-full after:border-4 after:border-slate-50 ${item.completed ? 'after:bg-indigo-600' : 'after:bg-gray-400'} group-last:before:hidden sm:flex-row sm:before:left-0 sm:before:ml-[6.5rem] sm:after:left-0 sm:after:ml-[6.5rem]`}>
                <div className="font-semibold text-slate-900">{item.title}
                    <div className="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 ml-2">
                        {item.completed ? (
                            <MdCheck className="h-3 w-3 text-emerald-600" />
                        ) : (
                            <MdAccessTime className="h-3 w-3 text-amber-600" />
                        )}
                    </div>
                </div>
            </div>
            <div className="text-sm text-slate-500">{item.description}</div>
            <div className="text-xs text-slate-300">{item.time} {item.status}</div>
        </div>

    )
}

export default Timeline