import classes from "./About.module.css";
import { StartButton } from "@/features/home/start_button";

const About = () => {
  return (
    <section className={classes.about}>
      <div className={classes.title_container}>
        <h1>LifeSync</h1>
        <span>- your ideal productivity tool</span>
      </div>
      <ul className={classes.benefits}>
        <li>Create personal and team events</li>
        <li>Plan tasks</li>
        <li>Sync everything in one place</li>
      </ul>
      <StartButton />
    </section>
  );
};

export { About };
