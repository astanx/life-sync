import classes from './EventsTable.module.css'
import { EventsTable } from '@/features/main/projects/events_table'
import { AddStageButton } from '@/features/main/projects/add_stage_button'
import { ModeSwitcher } from '@/features/main/projects/mode_switcher/ModeSwitcher'

const EventsTableWidget = () => {
  return (
    <div className={classes.table_container}>
          <div className={classes.table_header}>
            <h1>Project Title</h1>
            <ModeSwitcher />
            <AddStageButton/>
          </div>
          <div className={classes.table}>
            <EventsTable />
          </div>
        </div>
  )
}

export {EventsTableWidget}
