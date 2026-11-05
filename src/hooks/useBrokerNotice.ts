import { useEffect, useState } from "react";
import { brokerNotice, type BrokerNotice } from "@/lib/brokers/region";

/** Which availability notice to show. Stays unknown, with no CFD links, if the country can't be determined. */
export function useBrokerNotice(): BrokerNotice {
  const [notice, setNotice] = useState<BrokerNotice>("unknown");

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
