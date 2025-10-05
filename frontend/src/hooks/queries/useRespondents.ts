import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../services/authService";

interface Respondent {
  id: string;
  _id: string;
  fullName: string;
  email: string;
  contactNo: string;
  isVerified: boolean;
  notes: string;
  verificationDocument?: string;
}

interface RespondersResponse {
  responders: Omit<Respondent, "id">[]; // _id exists, id does not
}


export const useRespondents = (activeTab: string) => {
  const queryClient = useQueryClient();

  const { data: respondents = [], isLoading } = useQuery<Respondent[]>({
    queryKey: ["respondents"],
    queryFn: async () => {
      const res = await api.get<RespondersResponse>("/admin/");
      // Extract the responders array and map _id to id
      const responders = res.data.responders || [];
      return responders.map((item ) => ({
        ...item,
        id: item._id, // Map _id to id for the table
      }));
    },
    enabled: activeTab === "respondents",
  });

  const toggleVerify = useMutation<string, unknown, string>({
    mutationFn: async (id: string) => {
      await api.put(`/admin/approve/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Respondent[]>(["respondents"], (old = []) =>
        old.map((r) =>
          r.id === id ? { ...r, isVerified: !r.isVerified } : r
        )
      );
    },
  });

  const handleToggleVerify = (row: Respondent) => toggleVerify.mutate(row.id);

  return { respondents, handleToggleVerify, isLoading };
};