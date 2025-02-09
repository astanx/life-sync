import React, { useState } from "react";
import classes from "./Accordion.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface AccordionItem {
  title: string;
  content?: string | JSX.Element;
  icon?: IconDefinition;

}

interface Props {
  items: AccordionItem[];
  light?: boolean;
}

const Accordion: React.FC<Props> = ({ items, light }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleClick = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={`${classes.accordion} ${light ? "" : classes.dark }`}>
      {items.map((item, index) => (
        <div
          key={index}
          className={`${classes.accordion_item} ${
            activeIndex === index ? classes.active : ""
          }`}
        >
          <div
            className={classes.accordion_header}
            onClick={() => handleClick(index)}
          >
            {item.icon && <FontAwesomeIcon icon={item.icon} className={classes.icon}/>}

            <span>{item.title}</span>
            <span
              className={`${classes.arrow} ${
                activeIndex === index ? classes.open : ""
              }`}
            ></span>
          </div>
          {activeIndex === index && light && (
            <div className={classes.accordion_content}>
              <p>{item.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export { Accordion };
