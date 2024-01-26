const GetEvent = (timelineEventList:) => {
  if (
        !timelineEventList.eventList.find(
          (element: NDKEvent) => element.id == event.id
        )
      ) {
        const created_at = event.created_at || 0;
        if (timelineEventList.until > created_at) {
          timelineEventList.until = created_at;
        }

        timelineEventList.push(event);
};
