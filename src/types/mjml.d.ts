declare module "mjml" {
  type MjmlRenderError = {
    message: string;
  };

  type MjmlRenderResult = {
    html: string;
    errors: MjmlRenderError[];
  };

  type MjmlOptions = {
    minify?: boolean;
    validationLevel?: "soft" | "strict" | "skip";
  };

  export default function mjml2html(
    input: string,
    options?: MjmlOptions,
  ): Promise<MjmlRenderResult> | MjmlRenderResult;
}
