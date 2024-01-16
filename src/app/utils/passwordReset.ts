import { FormApi } from "final-form";

export async function resetFormPassword<T>(
  form: FormApi<T, Partial<T>>,
  name = "password",
) {
  // Reset sensetive field
  form.change(name as any, "" as any);
  // Await rerender
  await new Promise((res) => setTimeout(res, 10));
}
