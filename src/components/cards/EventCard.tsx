import type { EventCardProps } from '../../types';
import { CalendarSVG, ClockSVG, LocationPinSVG, VolunteerSVG } from '../icons';

export function EventCard(props: EventCardProps) {
  return (
    <div className="shadow-lg rounded-xl p-6 h-full min-h-[300px] w-full max-w-[500px]">
      <div>
        <div className="flex gap-1 justify-between items-center">
          <div className="font-medium text-lg">{props.name}</div>
          <div className="text-sm pt-1 pb-1 pl-2 pr-2 bg-(--color-jade) text-white font-semibold rounded-xl">
            {props.category}
          </div>
        </div>
        <div className="text-gray-600 font-normal">{props.org}</div>
      </div>
      <div className="text-gray-600 pt-4 pb-4">
        <div className="pb-2">{props.description}</div>
        <div className="flex items-center gap-2">
          <CalendarSVG size={20} />
          <div>{props.date}</div>
        </div>
        <div className="flex items-center gap-2">
          <ClockSVG size={20} />
          <div>
            {props.timerange[0]} - {props.timerange[1]}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LocationPinSVG size={20} />
          <div>{props.place}</div>
        </div>
        <div className="flex items-center gap-2">
          <VolunteerSVG size={20} />
          <div>
            {props.currVolunteers} / {props.maxVolunteers} volunteers
          </div>
        </div>
      </div>
      <div>
        <button>View Details</button>
        <button>Signed up</button>
      </div>
    </div>
  );
}