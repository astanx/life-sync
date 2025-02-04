import { Accordion } from "@/shared/ui/accordion";
import { faHome } from "@fortawesome/free-solid-svg-icons";

const Main = () => {
  const accordionItems = [
    { title: "Заголовок 1", content: "Содержимое панели 1." },
    { title: "Заголовок 2", content: "Содержимое панели 2." },
    { title: "Заголовок 3", content: "Содержимое панели 3.", icon: faHome },
  ];

  return (
    <div>
      <Accordion items={accordionItems} />
    </div>
  );
};

export { Main };
