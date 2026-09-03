import { libraryTopicIdForTerm } from "../lib/topic-taxonomy";

const BATCH_SIZE = 18;
const PRELOAD_PX = 480;

type SortMode = "featured" | "rating" | "downloads" | "name" | "newest";

const gallery = document.querySelector<HTMLElement>("[data-library-gallery]");

if (gallery && gallery.dataset.enhanced !== "true") {
  gallery.dataset.enhanced = "true";

  const items = Array.from(
    gallery.querySelectorAll<HTMLElement>("[data-library-item]"),
  );
  const search = document.querySelector<HTMLInputElement>("#library-search");
  const searchClear = document.querySelector<HTMLButtonElement>("#library-search-clear");
  const kind = document.querySelector<HTMLSelectElement>("#library-kind");
  const worksWith = document.querySelector<HTMLSelectElement>("#library-works-with");
  const topic = document.querySelector<HTMLSelectElement>("#library-topic");
  const contributor = document.querySelector<HTMLSelectElement>("#library-contributor");
  const sort = document.querySelector<HTMLSelectElement>("#library-sort");
  const reset = document.querySelector<HTMLButtonElement>("#library-reset");
  const count = document.querySelector<HTMLElement>("[data-library-result-count]");
  const empty = document.querySelector<HTMLElement>("[data-library-empty]");
  const sentinel = document.querySelector<HTMLElement>("[data-library-sentinel]");

  const SORTS: SortMode[] = [
    "featured",
    "rating",
    "downloads",
    "name",
    "newest",
  ];
  let shown = BATCH_SIZE;
  let matched: HTMLElement[] = items;

  const parseList = (value: string | undefined): string[] => {
    if (!value) return [];
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((entry): entry is string => typeof entry === "string")
        : [];
    } catch {
      return value.split(",").map((entry) => entry.trim()).filter(Boolean);
    }
  };

  const numeric = (item: HTMLElement, key: string): number =>
    Number(item.dataset[key] ?? "0") || 0;

  const selectedSort = (): SortMode => {
    const value = sort?.value as SortMode | undefined;
    return value && SORTS.includes(value) ? value : "featured";
  };

  const byName = (left: HTMLElement, right: HTMLElement): number =>
    (left.dataset.name ?? "").localeCompare(right.dataset.name ?? "");

  const sortItems = (list: HTMLElement[]): HTMLElement[] =>
    [...list].sort((left, right) => {
      switch (selectedSort()) {
        case "rating":
          return numeric(right, "rating") - numeric(left, "rating") || byName(left, right);
        case "downloads":
          return numeric(right, "downloads") - numeric(left, "downloads") || byName(left, right);
        case "name":
          return byName(left, right);
        case "newest":
          return numeric(right, "updated") - numeric(left, "updated") || byName(left, right);
        case "featured":
        default:
          return numeric(right, "featured") - numeric(left, "featured") || byName(left, right);
      }
    });

  const computeMatches = (): HTMLElement[] => {
    const query = search?.value.trim().toLocaleLowerCase() ?? "";
    const selectedKind = kind?.value ?? "";
    const selectedCompatibility = worksWith?.value ?? "";
    const selectedTopic = topic?.value ?? "";
    const selectedContributor = contributor?.value ?? "";

    return sortItems(
      items.filter((item) => {
        const searchable = item.dataset.search ?? "";
        const compatibility = parseList(item.dataset.worksWith);
        const topics = parseList(item.dataset.topics);
        return (
          (!query || searchable.includes(query)) &&
          (!selectedKind || item.dataset.kind === selectedKind) &&
          (!selectedCompatibility || compatibility.includes(selectedCompatibility)) &&
          (!selectedTopic || topics.includes(selectedTopic)) &&
          (!selectedContributor || item.dataset.contributor === selectedContributor)
        );
      }),
    );
  };

  const sentinelInView = (): boolean => {
    if (!sentinel) return false;
    const rect = sentinel.getBoundingClientRect();
    return rect.top <= window.innerHeight + PRELOAD_PX && rect.bottom >= -PRELOAD_PX;
  };

  const render = (): void => {
    items.forEach((item) => {
      item.hidden = true;
    });
    matched.slice(0, shown).forEach((item) => {
      item.hidden = false;
    });
    if (count) count.textContent = String(matched.length);
    if (empty) empty.hidden = matched.length > 0;
    if (searchClear) searchClear.hidden = !search?.value;
  };

  const fillViewport = (): void => {
    let guard = 0;
    while (shown < matched.length && sentinelInView() && guard < 100) {
      shown = Math.min(shown + BATCH_SIZE, matched.length);
      render();
      guard += 1;
    }
  };

  const reorder = (): void => {
    const fragment = document.createDocumentFragment();
    matched.forEach((item) => fragment.append(item));
    items.filter((item) => !matched.includes(item)).forEach((item) => fragment.append(item));
    gallery.append(fragment);
  };

  const syncUrl = (): void => {
    const params = new URLSearchParams();
    const query = search?.value.trim() ?? "";
    if (query) params.set("q", query);
    if (kind?.value) params.set("kind", kind.value);
    if (worksWith?.value) params.set("worksWith", worksWith.value);
    if (topic?.value) params.set("topic", topic.value);
    if (contributor?.value) params.set("contributor", contributor.value);
    if (sort?.value && sort.value !== "featured") params.set("sort", sort.value);
    const queryString = params.toString();
    history.replaceState(null, "", queryString ? `?${queryString}` : location.pathname);
  };

  const refilter = (updateUrl = true): void => {
    matched = computeMatches();
    shown = BATCH_SIZE;
    reorder();
    render();
    fillViewport();
    if (updateUrl) syncUrl();
  };

  const setIfAvailable = (
    control: HTMLSelectElement | null,
    value: string | null,
  ): void => {
    if (!control || !value) return;
    if (Array.from(control.options).some((option) => option.value === value)) {
      control.value = value;
    }
  };

  const initialiseFromUrl = (): void => {
    const params = new URLSearchParams(location.search);
    if (search) search.value = params.get("q") ?? "";
    setIfAvailable(kind, params.get("kind") ?? params.get("type"));
    setIfAvailable(
      worksWith,
      params.get("worksWith") ?? params.get("platform"),
    );
    setIfAvailable(
      topic,
      (() => {
        const requested = params.get("topic") ?? params.get("tag")?.split(",")[0] ?? null;
        if (!requested) return null;
        return libraryTopicIdForTerm(requested) ?? requested.toLocaleLowerCase();
      })(),
    );
    setIfAvailable(
      contributor,
      params.get("contributor") ?? params.get("author")?.split(",")[0] ?? null,
    );
    setIfAvailable(sort, params.get("sort"));
    refilter(false);
  };

  let searchTimer: number | undefined;
  search?.addEventListener("input", () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => refilter(), 120);
    if (searchClear) searchClear.hidden = !search.value;
  });
  searchClear?.addEventListener("click", () => {
    if (!search) return;
    search.value = "";
    refilter();
    search.focus();
  });
  [kind, worksWith, topic, contributor, sort].forEach((control) =>
    control?.addEventListener("change", () => refilter()),
  );
  reset?.addEventListener("click", () => {
    if (search) search.value = "";
    [kind, worksWith, topic, contributor].forEach((control) => {
      if (control) control.value = "";
    });
    if (sort) sort.value = "featured";
    refilter();
    search?.focus();
  });

  if (sentinel && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || shown >= matched.length) return;
        shown = Math.min(shown + BATCH_SIZE, matched.length);
        render();
      },
      { rootMargin: `${PRELOAD_PX}px` },
    );
    observer.observe(sentinel);
  }

  const scrollKey = "ai-library-scroll";
  history.scrollRestoration = "manual";

  const saveScroll = (): void => {
    try {
      sessionStorage.setItem(
        scrollKey,
        JSON.stringify({ href: location.href, y: window.scrollY, shown }),
      );
    } catch {
      // Storage can be unavailable in private browsing. Filtering still works.
    }
  };

  const restoreScroll = (): void => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(scrollKey) ?? "null") as {
        href?: string;
        y?: number;
        shown?: number;
      } | null;
      if (!saved || saved.href !== location.href) return;
      shown = Math.min(
        Math.max(shown, Number(saved.shown) || BATCH_SIZE),
        matched.length,
      );
      render();
      window.scrollTo(0, Number(saved.y) || 0);
    } catch {
      // Ignore malformed or unavailable session state.
    }
  };

  initialiseFromUrl();
  const navigation = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (navigation?.type === "back_forward" || navigation?.type === "reload") {
    restoreScroll();
  }
  window.addEventListener("pagehide", saveScroll);
  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    initialiseFromUrl();
    restoreScroll();
  });
}
