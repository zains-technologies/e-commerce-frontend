export interface NavigationItem {
  title: string;
  slug: string;
  children?: NavigationItem[];
}

export interface NavigationPayload {
  navigation: NavigationItem[];
}
