const formatDateTime = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return isNaN(date.getTime())
      ? "Wrong date"
      : new Intl.DateTimeFormat("en-EN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(date);
  } catch (e){
    console.error(e)
    return;
  }
};

export { formatDateTime };
