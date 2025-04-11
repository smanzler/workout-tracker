import { supabase } from "@/lib/supabase";
import { useInfiniteQuery } from "@tanstack/react-query";

const fetchExplorePosts = async ({ pageParam = 0 }) => {
  const { data, error } = await supabase.rpc("get_explore_posts", {
    p_offset: pageParam,
    p_limit: 20,
    p_sort_by: "created_at",
    p_sort_order: "desc",
    p_filter: null,
  });

  if (error) throw error;
  return data;
};

export const useExplorePosts = () => {
  return useInfiniteQuery({
    queryKey: ["explore-posts"],
    queryFn: fetchExplorePosts,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length < 20 ? undefined : allPages.length * 20;
    },
  });
};
