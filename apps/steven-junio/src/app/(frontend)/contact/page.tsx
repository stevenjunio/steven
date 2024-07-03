import { z } from "zod";

const formSchema = z.object({
  name: z.string({ invalid_type_error: "Missing name" }).min(0),
  email: z.string().email(),
  message: z.string().min(1),
});

export default function ContactPage() {
  async function handleContactForm(formData: FormData) {
    "use server";
    const validatedData = formSchema.safeParse({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      message: formData.get("message") as string,
    });

    console.log(`running on server`, validatedData);
    if (validatedData.success) {
      console.log(`running on server`, validatedData.data);
      // send email
    }
  }

  return (
    <form
      className="max-w-screen-md m-auto mt-4 bg-secondary p-5 flex flex-col gap-3"
      action={handleContactForm}
    >
      <input
        type="email"
        placeholder="email"
        required
        title="email"
        name="email"
        className="bg-white h-10 p-4"
      />
      <input
        type="text"
        required
        title="name"
        name="name"
        placeholder="name"
        className="bg-white h-10 p-4"
      />
      <textarea
        title="message"
        name="message"
        placeholder="message"
        className="bg-white h-40 p-4"
        minLength={5}
      />
      <button
        type="submit"
        className="bg-black text-secondary py-2 rounded mt-3"
      >
        Submit
      </button>
    </form>
  );
}
