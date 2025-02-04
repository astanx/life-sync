import { Accordion } from "@/shared/ui/accordion";
import classes from './ProjectsAccordion.module.css'

const ProjectsAccordion = () => {
  const accordionItems = [
    { title: "project 1"},
    { title: "project 2"},
    { title: "project 3" },
    { title: "project 4"},
  ];
  return (
    <div className={classes.accordion_container}>
      <h6>Recent Projects</h6>
      <Accordion items={accordionItems} />
    </div>
  );
};

export { ProjectsAccordion };
