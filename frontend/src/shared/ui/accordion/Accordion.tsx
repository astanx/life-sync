import React from "react";
import classes from "./Accordion.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";


interface AccordionItem {
  title: string;
  content?: string | JSX.Element;
  icon?: IconDefinition;
  id: number;
}

interface Props {
  items: AccordionItem[];
  light?: boolean;
  activeId: number;
  onClick?: (itemId: number) => void;
}

const Accordion: React.FC<Props> = ({ items, light, activeId, onClick }) => {
  const handleClick = (itemId: number) => {
    if (onClick) {
      onClick(itemId);
    }
  };

  return (
    <div className={`${classes.accordion} ${light ? "" : classes.dark}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`${classes.accordion_item} ${
            activeId === item.id ? classes.active : ""
          }`}
        >
          <div
            className={classes.accordion_header}
            onClick={() => handleClick(item.id)}
          >
            {item.icon && (
              <FontAwesomeIcon icon={item.icon} className={classes.icon} />
            )}

            <span>{item.title}</span>
            <span
              className={`${classes.arrow} ${
                activeId === item.id ? classes.open : ""
              }`}
            ></span>
          </div>
          {
            (activeId === item.id && light && (
              <div className={classes.accordion_content}>
                <div>{item.content}</div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export { Accordion };
