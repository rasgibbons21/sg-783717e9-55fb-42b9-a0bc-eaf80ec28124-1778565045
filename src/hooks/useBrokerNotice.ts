import { useEffect, useState } from "react";
import { brokerNotice, type BrokerNotice } from "@/lib/brokers/region";

/** Which availability notice to show. Stays general if the country can't be determined. */
export function useBrokerNotice(): BrokerNotice {
  const [notice, setNotice] = useState<BrokerNotice>("general");

  useEffect(() => {
    let active = true;
    fetch("/api/geo")
      .then((res) => (res.ok ? res.json() : { country: null }))
      .then(({ country }) => {
        if (active) setNotice(brokerNotice(country));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return notice;
}
