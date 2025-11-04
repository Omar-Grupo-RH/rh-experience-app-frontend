import CommentsAPI from "@/api/Comments";

export function useComments() {
  const listComments = async () => {
    const { data } = await CommentsAPI.allComments();
    return data.data ?? [];
  };

  const createComment = async (payload) => {
    const { data } = await CommentsAPI.newComment(payload);
    return data ?? [];
  };

  const modifyComment = async (payload) => {
    const { data } = await CommentsAPI.editComment(payload);
    return data ?? [];
  };

  return { listComments, createComment, modifyComment };
}
