import calendar_preview from "@/shared/assets/images/calendar_preview.png";
import { About } from "@/widgets/main/about";
import { Header } from "@/widgets/main/header";
import classes from './Home.module.css'

const Home = () => {
  return (
    <div>
      <Header />
      <div className={classes.about_container}>
      <About />
      <img src={calendar_preview} />
      </div>
      
    </div>
  );
};

export { Home };
