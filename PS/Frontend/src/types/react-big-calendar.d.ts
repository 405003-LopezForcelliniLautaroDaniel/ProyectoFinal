declare module 'react-big-calendar' {
  import { ComponentType } from 'react';

  export type View = 'month' | 'week' | 'work_week' | 'day' | 'agenda';

  export interface Event {
    id?: string | number;
    title: string;
    start: Date;
    end: Date;
    resource?: any;
    allDay?: boolean;
  }

  export interface SlotInfo {
    start: Date | string;
    end: Date | string;
    slots: Date[] | string[];
    action: 'select' | 'click' | 'doubleClick';
  }

  export interface DateLocalizer {
    formats: any;
    propType: any;
  }

  export interface CalendarProps {
    localizer: DateLocalizer;
    events: Event[];
    startAccessor?: string | ((event: Event) => Date);
    endAccessor?: string | ((event: Event) => Date);
    style?: React.CSSProperties;
    onSelectEvent?: (event: Event) => void;
    onSelectSlot?: (slotInfo: SlotInfo) => void;
    selectable?: boolean | 'ignoreEvents';
    messages?: any;
    formats?: any;
    culture?: string;
    view?: View;
    onView?: (view: View) => void;
    date?: Date;
    onNavigate?: (date: Date, view?: View, action?: 'PREV' | 'NEXT' | 'TODAY' | 'DATE') => void;
    eventPropGetter?: (event: Event) => { style?: React.CSSProperties; className?: string };
    popup?: boolean;
    components?: any;
    step?: number;
    timeslots?: number;
    min?: Date;
    max?: Date;
    scrollToTime?: Date;
    className?: string;
  }

  export const Calendar: ComponentType<CalendarProps>;

  export interface DateLocalizerOptions {
    format: (value: Date, format: string, culture?: string) => string;
    parse: (value: string, format: string, culture?: string) => Date;
    startOfWeek: (culture?: string) => number;
    getDay: (value: Date) => number;
    locales: { [key: string]: any };
  }

  export function dateFnsLocalizer(options: DateLocalizerOptions): DateLocalizer;
}

