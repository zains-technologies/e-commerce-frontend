"use client";

import { useEffect, useState } from "react";
import { navigationService } from "@/services/navigationService";
import type { NavigationItem } from "@/types/navigation";

export function useNavigation() {
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigationService
      .get()
      .then((items) => {
        setNavigation(items);
        setError(null);
      })
      .catch((err: Error) => {
        setNavigation([]);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { navigation, loading, error };
}
