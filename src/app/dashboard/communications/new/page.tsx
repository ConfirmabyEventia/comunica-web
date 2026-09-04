"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useRef,
  useState,
  useEffect,
  Suspense,
  type CSSProperties,
  type MouseEvent,
  type ChangeEvent,
} from "react";
import Sidebar from "@/components/studio/Sidebar";
import { supabase } from "@/lib/supabase/client";

type CommunicationTemplate = {
  id: string;
  name: string;
  description: string | null;
  message: string;
  content_html: string | null;
  color_theme: string | null;
  typography: string | null;
  button_text: string | null;
  button_url: string | null;
};

type Communication = {
  id: string;
  internal_name: string;
  title: string;
  message: string;
  content_html: string | null;
  button_text: string | null;
  button_url: string | null;
  status: "Borrador" | "Enviada";
  color_theme: string | null;
  typography: string | null;
  wp_id: string | null;
};

type ColorTheme = {
  id: string;
  name: string;
  color: string;
  soft: string;
};

type Typography = {
  id: string;
  name: string;
  font: string;
  fontFamily: string;
  sample: string;
};

const colorThemes: ColorTheme[] = [
  {
    id: "salvia",
    name: "Salvia",
    color: "#A7A98A",
    soft: "#EEF0E7",
  },
  {
    id: "lavanda",
    name: "Lavanda",
    color: "#B8A5BD",
    soft: "#F1EBF3",
  },
  {
    id: "terracota",
    name: "Terracota",
    color: "#C97A5B",
    soft: "#F6E9E3",
  },
  {
    id: "arena",
    name: "Arena",
    color: "#D8C4A4",
    soft: "#F5EFE6",
  },
  {
    id: "azul-niebla",
    name: "Azul Niebla",
    color: "#7890A1",
    soft: "#E9EFF2",
  },
  {
    id: "vino",
    name: "Vino",
    color: "#76283A",
    soft: "#F1E4E7",
  },
];

const typographyOptions: Typography[] = [
  {
    id: "editorial",
    name: "Editorial",
    font: "Cormorant Garamond",
    fontFamily: "'Cormorant Garamond', serif",
    sample: "Aa",
  },
  {
    id: "clasica",
    name: "Clásica",
    font: "Playfair Display",
    fontFamily: "'Playfair Display', serif",
    sample: "Aa",
  },
  {
    id: "contemporanea",
    name: "Contemporánea",
    font: "Montserrat",
    fontFamily: "'Montserrat', sans-serif",
    sample: "Aa",
  },
 {
  id: "romantica",
  name: "Suave",
  font: "Trebuchet MS",
  fontFamily: "'Trebuchet MS', Arial, sans-serif",
  sample: "Aa",
},
];

const emojis = [
  "😊",
  "❤️",
  "✨",
  "🥂",
  "🎉",
  "💐",
  "📍",
  "🗓️",
  "🤍",
  "🌿",
  "💫",
  "🎶",
];

const imageSizes = [
  {
    id: "small",
    label: "Pequeña",
    width: "40%",
  },
  {
    id: "medium",
    label: "Mediana",
    width: "60%",
  },
  {
    id: "large",
    label: "Grande",
    width: "80%",
  },
  {
    id: "full",
    label: "Completa",
    width: "100%",
  },
];

function NewCommunicationPageContent() {
  const titleFontSizes: Record<string, string> = {
  small: "1.65rem",
  normal: "2rem",
  large: "2.4rem",
};

const messageFontSizes: Record<string, string> = {
  small: "0.9rem",
  normal: "1rem",
  large: "1.15rem",
};
  const [internalName, setInternalName] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  const [selectedColor, setSelectedColor] =
    useState("lavanda");

  const [selectedTypography, setSelectedTypography] =
  useState("editorial");

const [titleSize, setTitleSize] = useState("normal");
const [messageSize, setMessageSize] = useState("normal");

  const [showEmojiPicker, setShowEmojiPicker] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [selectedImage, setSelectedImage] =
    useState<HTMLImageElement | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [applyingTemplateId, setApplyingTemplateId] = useState<string | null>(null);

  const [wpId, setWpId] = useState("");
  const [createdId, setCreatedId] =
    useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editingCommunicationId, setEditingCommunicationId] = useState<string | null>(null);
  const [communicationSaved, setCommunicationSaved] = useState(false);
  const [loadingCommunication, setLoadingCommunication] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();

  const imageInputRef =
    useRef<HTMLInputElement | null>(null);

  const savedRangeRef =
    useRef<Range | null>(null);

  const activeColor =
    colorThemes.find(
      (theme) => theme.id === selectedColor
    ) ?? colorThemes[1];

  const activeTypography =
    typographyOptions.find(
      (font) => font.id === selectedTypography
    ) ?? typographyOptions[0];
const textSizes = [
  {
    id: "small",
    label: "Pequeño",
  },
  {
    id: "normal",
    label: "Normal",
  },
  {
    id: "large",
    label: "Grande",
  },
] as const;
  const publicUrl = createdId
    ? `https://comunica.evensse.com/message/${createdId}`
    : "";

  function saveCurrentSelection() {
    const editor = editorRef.current;

    if (!editor) return;

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);

    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }

    savedRangeRef.current = range.cloneRange();
  }

  function updateContent() {
    const editor = editorRef.current;

    if (!editor) return;

    const html = editor.innerHTML;

    setContentHtml(html);

    const plainText = editor.innerText
      .replace(/\u00a0/g, " ")
      .trim();

    setMessage(plainText);
  }

  function executeCommand(
    command:
      | "bold"
      | "italic"
      | "underline"
      | "justifyLeft"
      | "justifyCenter"
      | "justifyRight"
      | "justifyFull"
  ) {
    editorRef.current?.focus();

    document.execCommand(command, false);

    updateContent();
    saveCurrentSelection();
  }

  function handleToolbarMouseDown(
    event: MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    saveCurrentSelection();
  }

  function insertEmoji(emoji: string) {
    const editor = editorRef.current;

    if (!editor) return;

    editor.focus();

    const selection = window.getSelection();

    if (savedRangeRef.current) {
      selection?.removeAllRanges();
      selection?.addRange(
        savedRangeRef.current
      );
    }

    document.execCommand(
      "insertText",
      false,
      emoji
    );

    updateContent();
    saveCurrentSelection();

    setShowEmojiPicker(false);
  }

  function openImagePicker() {
    saveCurrentSelection();
    imageInputRef.current?.click();
  }

  async function handleImageChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Selecciona un archivo de imagen válido."
      );
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError(
        "La imagen debe pesar menos de 8 MB."
      );
      return;
    }

    try {
      setUploadingImage(true);
      setError("");

      const extension =
        file.name.split(".").pop() || "jpg";

      const filePath = `${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } =
        await supabase.storage
          .from("communication-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("communication-images")
        .getPublicUrl(filePath);

      const imageUrl =
        publicUrlData.publicUrl;

      const editor = editorRef.current;

      if (!editor) return;

      editor.focus();

      const selection = window.getSelection();

      if (savedRangeRef.current) {
        selection?.removeAllRanges();
        selection?.addRange(
          savedRangeRef.current
        );
      } else {
        const range =
          document.createRange();

        range.selectNodeContents(editor);
        range.collapse(false);

        selection?.removeAllRanges();
        selection?.addRange(range);
      }

      const image =
        document.createElement("img");

      image.src = imageUrl;
      image.alt = "";
      image.style.width = "80%";
      image.style.maxWidth = "100%";
      image.style.height = "auto";
      image.style.display = "block";
      image.style.margin = "18px auto";
      image.style.borderRadius = "14px";
      image.style.cursor = "pointer";

      const range = selection?.rangeCount
        ? selection.getRangeAt(0)
        : null;

      if (range) {
        range.deleteContents();
        range.insertNode(image);

        range.setStartAfter(image);
        range.collapse(true);

        selection?.removeAllRanges();
        selection?.addRange(range);
      } else {
        editor.appendChild(image);
      }

      setSelectedImage(image);

      updateContent();
      saveCurrentSelection();
    } catch (err) {
      console.error(
        "Error uploading communication image:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "No fue posible subir la imagen."
      );
    } finally {
      setUploadingImage(false);
    }
  }

  function handleEditorClick(
    event: MouseEvent<HTMLDivElement>
  ) {
    const target = event.target;

    if (
      target instanceof HTMLImageElement
    ) {
      setSelectedImage(target);
      return;
    }

    setSelectedImage(null);
  }

  function changeImageSize(
    width: string
  ) {
    if (!selectedImage) return;

    selectedImage.style.width = width;
    selectedImage.style.maxWidth = "100%";
    selectedImage.style.height = "auto";

    updateContent();
  }

  async function loadTemplates() {
    try {
      setLoadingTemplates(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("communication_templates")
        .select(
          `
            id,
            name,
            description,
            message,
            content_html,
            color_theme,
            typography,
            button_text,
            button_url
          `
        )
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setTemplates((data ?? []) as CommunicationTemplate[]);
    } catch (err) {
      console.error("Error cargando plantillas:", err);
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar las plantillas."
      );
    } finally {
      setLoadingTemplates(false);
    }
  }

  function applyTemplate(template: CommunicationTemplate) {
    const editor = editorRef.current;

    setApplyingTemplateId(template.id);
    setError("");

    setInternalName(template.name);
    setTitle(template.name);
    setSelectedColor(
      colorThemes.some((theme) => theme.id === template.color_theme)
        ? template.color_theme || "lavanda"
        : "lavanda"
    );
    setSelectedTypography(
      typographyOptions.some((font) => font.id === template.typography)
        ? template.typography || "editorial"
        : "editorial"
    );

    const html = template.content_html?.trim() || "";
    setContentHtml(html);
    setMessage(template.message || "");

    if (editor) {
      editor.innerHTML = html;
      setMessage(
        editor.innerText.replace(/\u00a0/g, " ").trim() ||
          template.message ||
          ""
      );
    }

    setSelectedImage(null);
    setShowTemplatePicker(false);
    setApplyingTemplateId(null);
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    const urlWpId = searchParams.get("wp_id");

    if (urlWpId) {
      setWpId(urlWpId.trim().toUpperCase());
    }

    const templateId = searchParams.get("template");
    const editTemplate = searchParams.get("editTemplate") === "true";

    if (!templateId || !templates.length) return;

    const template = templates.find((item) => item.id === templateId);

    if (template) {
      if (editTemplate) {
        setEditingTemplateId(template.id);
        setTemplateSaved(false);
      } else {
        setEditingTemplateId(null);
      }

      applyTemplate(template);
    }
  }, [searchParams, templates]);

  useEffect(() => {
    const communicationId = searchParams.get("communication");

    if (!communicationId) {
      setEditingCommunicationId(null);
      return;
    }

    let cancelled = false;

    async function loadCommunicationForEdit() {
      try {
        setLoadingCommunication(true);
        setError("");
        setCommunicationSaved(false);

        const { data, error: fetchError } = await supabase
          .from("communications")
          .select(
            `
              id,
              internal_name,
              title,
              message,
              content_html,
              button_text,
              button_url,
              status,
              color_theme,
              typography,
              wp_id
            `
          )
          .eq("id", communicationId)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (!data) {
          throw new Error("No se encontró la comunicación.");
        }

        if (data.status !== "Borrador") {
          throw new Error("Solo puedes editar comunicaciones en estado Borrador.");
        }

        if (cancelled) return;

        const communication = data as Communication;

        setEditingCommunicationId(communication.id);
        setEditingTemplateId(null);
        setInternalName(communication.internal_name || "");
        setWpId(communication.wp_id || "");
        setTitle(communication.title || "");
        setSelectedColor(
          colorThemes.some((theme) => theme.id === communication.color_theme)
            ? communication.color_theme || "lavanda"
            : "lavanda"
        );
        setSelectedTypography(
          typographyOptions.some((font) => font.id === communication.typography)
            ? communication.typography || "editorial"
            : "editorial"
        );

        const html = communication.content_html?.trim() || "";
        setContentHtml(html);
        setMessage(communication.message || "");

        if (editorRef.current) {
          editorRef.current.innerHTML = html;
          setMessage(
            editorRef.current.innerText.replace(/\u00a0/g, " ").trim() ||
              communication.message ||
              ""
          );
        }
      } catch (err) {
        console.error("Error cargando comunicación para editar:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No fue posible cargar la comunicación."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCommunication(false);
        }
      }
    }

    loadCommunicationForEdit();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  async function handleSave() {
    const editor = editorRef.current;

    const currentHtml =
      editor?.innerHTML || contentHtml;

    const plainText =
      editor?.innerText
        .replace(/\u00a0/g, " ")
        .trim() || message.trim();

    if (
      !internalName.trim() ||
      !title.trim() ||
      !plainText ||
      (!editingTemplateId && !editingCommunicationId && !wpId.trim())
    ) {
      setError(
        editingTemplateId || editingCommunicationId
          ? "Completa el nombre interno, el título y el mensaje."
          : "Completa el WP ID, el nombre interno, el título y el mensaje."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setCopied(false);
      setTemplateSaved(false);

      if (editingCommunicationId) {
        const { error: updateError } = await supabase
          .from("communications")
          .update({
            internal_name: internalName.trim(),
            wp_id: wpId.trim().toUpperCase(),
            title: title.trim(),
            message: plainText,
            content_html: currentHtml,
            color_theme: selectedColor,
            typography: selectedTypography,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingCommunicationId);

        if (updateError) {
          throw updateError;
        }

        setContentHtml(currentHtml);
        setMessage(plainText);
        setCreatedId(editingCommunicationId);
        setCommunicationSaved(true);
        return;
      }

      if (editingTemplateId) {
        const { error: updateError } = await supabase
          .from("communication_templates")
          .update({
            name: title.trim(),
            message: plainText,
            content_html: currentHtml,
            color_theme: selectedColor,
            typography: selectedTypography,
          })
          .eq("id", editingTemplateId);

        if (updateError) {
          throw updateError;
        }

        setContentHtml(currentHtml);
        setMessage(plainText);
        setTemplateSaved(true);
        return;
      }

      const { data, error: insertError } =
        await supabase
          .from("communications")
          .insert({
            internal_name:
              internalName.trim(),

            wp_id: wpId.trim().toUpperCase(),

            title: title.trim(),

            message: plainText,

            content_html: currentHtml,

            color_theme: selectedColor,

            typography: selectedTypography,

            status: "Borrador",

            is_published: true,
          })
          .select("id")
          .single();

      if (insertError) {
        throw insertError;
      }

      setContentHtml(currentHtml);
      setMessage(plainText);
      setCreatedId(data.id);
    } catch (err) {
      console.error(
        editingTemplateId
          ? "Error updating communication template:"
          : "Error creating communication:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : editingTemplateId
            ? "No fue posible actualizar la plantilla."
            : "No fue posible crear la comunicación."
      );
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(
        publicUrl
      );

      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        2200
      );
    } catch {
      setError(
        "No fue posible copiar el enlace."
      );
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background:
          "var(--color-background)",
      }}
    >
      <Sidebar />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: "30px 46px 70px",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
          }}
        >
          {/* BACK */}

          <Link
            href={editingTemplateId ? "/dashboard/templates" : "/dashboard/communications"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "42px",
              color: "var(--color-accent)",
              fontSize: "0.95rem",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <span
              style={{
                fontSize: "1.25rem",
                lineHeight: 1,
              }}
            >
              ←
            </span>

            <span>
              {editingTemplateId
                ? "Volver a Plantillas"
                : "Volver a Comunicaciones"}
            </span>
          </Link>

          {/* HEADER */}

          <section
            style={{
              marginBottom: "34px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform:
                  "uppercase",
                color: "var(--color-accent)",
              }}
            >
              COMUNICA
            </p>

            <h1
              style={{
                margin: "10px 0 0",
                fontFamily:
                  "var(--font-display)",
                fontSize: "3.35rem",
                fontWeight: 500,
                lineHeight: 1.05,
                color: "var(--color-text)",
              }}
            >
              {editingCommunicationId
                ? "Editar comunicación"
                : editingTemplateId
                  ? "Editar plantilla"
                  : "Nueva comunicación"}
            </h1>

            <p
              style={{
                maxWidth: "650px",
                margin: "12px 0 0",
                fontSize: "1rem",
                lineHeight: 1.6,
                color:
                  "var(--color-text-secondary)",
              }}
            >
              {editingCommunicationId
                ? "Modifica tu comunicación y guarda los cambios antes de enviarla."
                : editingTemplateId
                  ? "Modifica el contenido de tu plantilla y guarda los cambios."
                  : "Crea el mensaje, asígnalo a un Wedding Planner y genera el enlace público para SendPulse."}
            </p>
          </section>

          {/* TEMPLATE PICKER */}

          {!editingTemplateId && !editingCommunicationId && (
          <section
            style={{
              marginBottom: "24px",
              padding: "18px 20px",
              borderRadius: "20px",
              background: "#FBF9F4",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "18px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.74rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--color-text-secondary)",
                }}
              >
                Plantillas
              </div>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "0.9rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                Empieza con una comunicación que ya guardaste.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowTemplatePicker(true)}
              style={{
                minHeight: "44px",
                padding: "0 20px",
                border: "1px solid var(--color-accent)",
                borderRadius: "999px",
                background: "#FFFFFF",
                color: "var(--color-accent)",
                fontSize: "0.84rem",
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Elegir una plantilla →
            </button>
          </section>
          )}

          {showTemplatePicker && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                background: "rgba(45, 39, 32, 0.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
              }}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                  setShowTemplatePicker(false);
                }
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "720px",
                  maxHeight: "80vh",
                  overflowY: "auto",
                  background: "#FFFFFF",
                  borderRadius: "28px",
                  padding: "28px",
                  boxSizing: "border-box",
                  boxShadow: "0 24px 70px rgba(40, 34, 28, 0.18)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "20px",
                    marginBottom: "22px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.7rem",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "var(--color-accent)",
                      }}
                    >
                      COMUNICA
                    </p>
                    <h2
                      style={{
                        margin: "7px 0 0",
                        fontFamily: "var(--font-display)",
                        fontSize: "2rem",
                        fontWeight: 500,
                        color: "var(--color-text)",
                      }}
                    >
                      Elige una plantilla
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowTemplatePicker(false)}
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "1px solid var(--color-border)",
                      borderRadius: "50%",
                      background: "#FFFFFF",
                      color: "var(--color-text-secondary)",
                      fontSize: "1.1rem",
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>
                </div>

                {loadingTemplates ? (
                  <div
                    style={{
                      padding: "45px 20px",
                      textAlign: "center",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Cargando plantillas...
                  </div>
                ) : templates.length === 0 ? (
                  <div
                    style={{
                      padding: "45px 20px",
                      textAlign: "center",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Aún no tienes plantillas guardadas.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                      gap: "14px",
                    }}
                  >
                    {templates.map((template) => {
                      const color =
                        colorThemes.find((item) => item.id === template.color_theme) ??
                        colorThemes[1];

                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => applyTemplate(template)}
                          disabled={applyingTemplateId === template.id}
                          style={{
                            textAlign: "left",
                            padding: "18px",
                            border: `1px solid ${color.color}55`,
                            borderRadius: "20px",
                            background: color.soft,
                            cursor: "pointer",
                            opacity: applyingTemplateId === template.id ? 0.6 : 1,
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "var(--font-display)",
                              fontSize: "1.35rem",
                              fontWeight: 500,
                              color: color.color,
                            }}
                          >
                            {template.name}
                          </div>

                          {template.description && (
                            <div
                              style={{
                                marginTop: "6px",
                                fontSize: "0.78rem",
                                lineHeight: 1.45,
                                color: "var(--color-text-secondary)",
                              }}
                            >
                              {template.description}
                            </div>
                          )}

                          <div
                            style={{
                              marginTop: "13px",
                              fontSize: "0.72rem",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {template.color_theme || "Sin color"} · {template.typography || "Sin tipografía"}
                          </div>

                          <div
                            style={{
                              marginTop: "12px",
                              fontSize: "0.78rem",
                              fontWeight: 500,
                              color: color.color,
                            }}
                          >
                            Usar esta plantilla →
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MAIN GRID */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1.25fr) minmax(360px, 0.75fr)",
              gap: "22px",
              alignItems: "start",
            }}
          >
            {/* LEFT */}

            <section
              style={{
                background:
                  "var(--color-surface)",
                border:
                  "1px solid var(--color-border)",
                borderRadius: "28px",
                padding: "30px 34px",
              }}
            >
              <div
                style={{
                  marginBottom: "6px",
                  fontSize: "0.76rem",
                  letterSpacing: "0.08em",
                  textTransform:
                    "uppercase",
                  color:
                    "var(--color-text-secondary)",
                }}
              >
                Contenido
              </div>

              <h2
                style={{
                  margin:
                    "4px 0 24px",
                  fontFamily:
                    "var(--font-display)",
                  fontSize: "1.8rem",
                  fontWeight: 500,
                  color:
                    "var(--color-text)",
                }}
              >
                Escribe tu comunicación
              </h2>

              {/* INTERNAL NAME */}

              <label
                htmlFor="internal-name"
                style={labelStyle}
              >
                Nombre interno *
              </label>

              <input
                id="internal-name"
                value={internalName}
                onChange={(e) =>
                  setInternalName(
                    e.target.value
                  )
                }
                placeholder="Ej. Recordatorio de información"
                style={inputStyle}
              />

              {/* TITLE */}

              <label
                htmlFor="title"
                style={labelStyle}
              >
                Título *
              </label>

              <input
                id="title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Ej. Tenemos información importante para ti"
                style={inputStyle}
              />
<div
  style={{
    marginTop: "14px",
  }}
>
  <div
    style={{
      fontSize: "0.76rem",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--color-text-secondary)",
      marginBottom: "8px",
    }}
  >
    Tamaño del título
  </div>

  <div
    style={{
      display: "flex",
      gap: "8px",
    }}
  >
    {textSizes.map((size) => {
      const selected = titleSize === size.id;

      return (
        <button
          key={size.id}
          type="button"
          onClick={() => setTitleSize(size.id)}
          style={{
            border: selected
              ? "1px solid var(--color-accent)"
              : "1px solid var(--color-border)",
            borderRadius: "999px",
            padding: "7px 13px",
            background: selected
              ? "var(--color-accent-soft, #F2ECE7)"
              : "#FFFFFF",
            color: selected
              ? "var(--color-accent)"
              : "var(--color-text)",
            fontSize: "0.76rem",
            fontWeight: selected ? 500 : 400,
            cursor: "pointer",
          }}
        >
          {size.label}
        </button>
      );
    })}
  </div>
</div>
              {/* WEDDING PLANNER */}

              <div
                style={{
                  marginTop: "24px",
                  padding: "18px",
                  borderRadius: "18px",
                  background: "#FBF9F4",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.76rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Wedding Planner
                </div>

                <p
                  style={{
                    margin: "7px 0 14px",
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Asigna esta comunicación al Wedding Planner usando el WP ID creado en WP STUDIO.
                </p>

                <input
                  value={wpId}
                  onChange={(e) =>
                    setWpId(e.target.value.toUpperCase())
                  }
                  placeholder="Ej. WP-0001"
                  style={{
                    ...inputStyle,
                    marginBottom: 0,
                    background: "#FFFFFF",
                    textTransform: "uppercase",
                  }}
                  disabled={!!createdId}
                />

                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "0.74rem",
                    lineHeight: 1.45,
                    color: "var(--color-text-muted)",
                  }}
                >
                  Si llegaste desde WP STUDIO, este campo puede venir precargado.
                </p>
              </div>

              {/* COLOR */}

              <div
                style={{
                  marginTop: "28px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.76rem",
                    letterSpacing: "0.08em",
                    textTransform:
                      "uppercase",
                    color:
                      "var(--color-text-secondary)",
                  }}
                >
                  Esencia / Color
                </div>

                <p
                  style={{
                    margin:
                      "7px 0 16px",
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                    color:
                      "var(--color-text-secondary)",
                  }}
                >
                  Elige el color que
                  representará tu
                  comunicación.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(6, minmax(0, 1fr))",
                    gap: "10px",
                  }}
                >
                  {colorThemes.map(
                    (theme) => {
                      const selected =
                        selectedColor ===
                        theme.id;

                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() =>
                            setSelectedColor(
                              theme.id
                            )
                          }
                          style={{
                            border: selected
                              ? `2px solid ${theme.color}`
                              : "1px solid var(--color-border)",
                            background:
                              "#FFFFFF",
                            borderRadius:
                              "16px",
                            padding:
                              "10px 7px 11px",
                            cursor:
                              "pointer",
                            boxShadow:
                              selected
                                ? `0 0 0 3px ${theme.soft}`
                                : "none",
                          }}
                        >
                          <div
                            style={{
                              width: "34px",
                              height: "34px",
                              margin:
                                "0 auto 8px",
                              borderRadius:
                                "50%",
                              background:
                                theme.color,
                            }}
                          />

                          <div
                            style={{
                              fontSize:
                                "0.72rem",
                              lineHeight:
                                1.2,
                              color:
                                "var(--color-text)",
                            }}
                          >
                            {theme.name}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* TYPOGRAPHY */}

              <div
                style={{
                  marginTop: "28px",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    fontSize: "0.76rem",
                    letterSpacing: "0.08em",
                    textTransform:
                      "uppercase",
                    color:
                      "var(--color-text-secondary)",
                  }}
                >
                  Tipografía
                </div>

                <p
                  style={{
                    margin:
                      "7px 0 16px",
                    fontSize: "0.9rem",
                    lineHeight: 1.5,
                    color:
                      "var(--color-text-secondary)",
                  }}
                >
                  Elige la tipografía que
                  quieras combinar con tu
                  color.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(4, minmax(0, 1fr))",
                    gap: "10px",
                  }}
                >
                  {typographyOptions.map(
                    (typography) => {
                      const selected =
                        selectedTypography ===
                        typography.id;

                      return (
                        <button
                          key={
                            typography.id
                          }
                          type="button"
                          onClick={() =>
                            setSelectedTypography(
                              typography.id
                            )
                          }
                          style={{
                            minHeight:
                              "112px",
                            border: selected
                              ? `2px solid ${activeColor.color}`
                              : "1px solid var(--color-border)",
                            borderRadius:
                              "16px",
                            background:
                              "#FFFFFF",
                            padding:
                              "14px",
                            cursor:
                              "pointer",
                            textAlign:
                              "left",
                            boxShadow:
                              selected
                                ? `0 0 0 3px ${activeColor.soft}`
                                : "none",
                          }}
                        >
                          <div
                            style={{
                              fontSize:
                                "0.72rem",
                              fontWeight:
                                600,
                              color:
                                "var(--color-text)",
                            }}
                          >
                            {
                              typography.name
                            }
                          </div>

                          <div
                            style={{
                              marginTop:
                                "3px",
                              fontSize:
                                "0.66rem",
                              color:
                                "var(--color-text-secondary)",
                            }}
                          >
                            {
                              typography.font
                            }
                          </div>

                          <div
                            style={{
                              marginTop:
                                "13px",
                              fontFamily:
                                typography.fontFamily,
                              fontWeight: 400,
                              fontSize:
                                typography.id ===
                                "romantica"
                                  ? "2.35rem"
                                  : "2rem",
                              lineHeight: 1,
                              color:
                                activeColor.color,
                            }}
                          >
                            {
                              typography.sample
                            }
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* MESSAGE */}

              <label
                htmlFor="message-editor"
                style={{
                  ...labelStyle,
                  marginTop: "30px",
                }}
              >
                Mensaje *
              </label>
<div
  style={{
    marginTop: "22px",
    marginBottom: "10px",
  }}
>
  <div
    style={{
      fontSize: "0.76rem",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "var(--color-text-secondary)",
      marginBottom: "8px",
    }}
  >
    Tamaño del mensaje
  </div>

  <div
    style={{
      display: "flex",
      gap: "8px",
    }}
  >
    {textSizes.map((size) => {
      const selected = messageSize === size.id;

      return (
        <button
          key={size.id}
          type="button"
          onClick={() => setMessageSize(size.id)}
          style={{
            border: selected
              ? "1px solid var(--color-accent)"
              : "1px solid var(--color-border)",
            borderRadius: "999px",
            padding: "7px 13px",
            background: selected
              ? "var(--color-accent-soft, #F2ECE7)"
              : "#FFFFFF",
            color: selected
              ? "var(--color-accent)"
              : "var(--color-text)",
            fontSize: "0.76rem",
            fontWeight: selected ? 500 : 400,
            cursor: "pointer",
          }}
        >
          {size.label}
        </button>
      );
    })}
  </div>
</div>
              {/* TOOLBAR */}

              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "6px",
                  flexWrap: "wrap",
                  padding:
                    "10px 12px",
                  border:
                    "1px solid var(--color-border)",
                  borderBottom:
                    "none",
                  borderRadius:
                    "14px 14px 0 0",
                  background:
                    "#FBF9F4",
                }}
              >
                <button
                  type="button"
                  title="Negrita"
                  onMouseDown={
                    handleToolbarMouseDown
                  }
                  onClick={() =>
                    executeCommand(
                      "bold"
                    )
                  }
                  style={{
                    ...toolbarButtonStyle,
                    fontWeight: 700,
                  }}
                >
                  B
                </button>

                <button
                  type="button"
                  title="Cursiva"
                  onMouseDown={
                    handleToolbarMouseDown
                  }
                  onClick={() =>
                    executeCommand(
                      "italic"
                    )
                  }
                  style={{
                    ...toolbarButtonStyle,
                    fontStyle: "italic",
                  }}
                >
                  I
                </button>

                <button
                  type="button"
                  title="Subrayado"
                  onMouseDown={
                    handleToolbarMouseDown
                  }
                  onClick={() =>
                    executeCommand(
                      "underline"
                    )
                  }
                  style={{
                    ...toolbarButtonStyle,
                    textDecoration:
                      "underline",
                  }}
                >
                  U
                </button>

                <div
                  style={{
                    width: "1px",
                    height: "24px",
                    margin:
                      "0 3px",
                    background:
                      "var(--color-border)",
                  }}
                />

                <button
                  type="button"
                  title="Alinear a la izquierda"
                  onMouseDown={
                    handleToolbarMouseDown
                  }
                  onClick={() =>
                    executeCommand(
                      "justifyLeft"
                    )
                  }
                  style={{
                    ...toolbarButtonStyle,
                    fontSize: "1.15rem",
                  }}
                >
                  ≡
                </button>

                <button
                  type="button"
                  title="Centrar"
                  onMouseDown={
                    handleToolbarMouseDown
                  }
                  onClick={() =>
                    executeCommand(
                      "justifyCenter"
                    )
                  }
                  style={{
                    ...toolbarButtonStyle,
                    fontSize: "1.15rem",
                    textAlign: "center",
                  }}
                >
                  ≡
                </button>

                <button
                  type="button"
                  title="Alinear a la derecha"
                  onMouseDown={
                    handleToolbarMouseDown
                  }
                  onClick={() =>
                    executeCommand(
                      "justifyRight"
                    )
                  }
                  style={{
                    ...toolbarButtonStyle,
                    fontSize: "1.15rem",
                    textAlign: "right",
                  }}
                >
                  ≡
                </button>

                <button
                  type="button"
                  title="Justificar"
                  onMouseDown={
                    handleToolbarMouseDown
                  }
                  onClick={() =>
                    executeCommand(
                      "justifyFull"
                    )
                  }
                  style={{
                    ...toolbarButtonStyle,
                    fontSize: "1.15rem",
                    letterSpacing: "-1px",
                  }}
                >
                  ≡
                </button>

                <div
                  style={{
                    width: "1px",
                    height: "24px",
                    margin:
                      "0 3px",
                    background:
                      "var(--color-border)",
                  }}
                />

                <div
                  style={{
                    position:
                      "relative",
                  }}
                >
                  <button
                    type="button"
                    title="Insertar emoji"
                    onMouseDown={
                      handleToolbarMouseDown
                    }
                    onClick={() =>
                      setShowEmojiPicker(
                        (value) =>
                          !value
                      )
                    }
                    style={{
                      ...toolbarButtonStyle,
                      fontSize:
                        "1.05rem",
                    }}
                  >
                    😊
                  </button>

                  {showEmojiPicker && (
                    <div
                      style={{
                        position:
                          "absolute",
                        top: "44px",
                        left: 0,
                        zIndex: 20,
                        display:
                          "grid",
                        gridTemplateColumns:
                          "repeat(4, 1fr)",
                        gap: "4px",
                        padding:
                          "8px",
                        width:
                          "170px",
                        background:
                          "#FFFFFF",
                        border:
                          "1px solid var(--color-border)",
                        borderRadius:
                          "14px",
                        boxShadow:
                          "0 12px 30px rgba(56, 51, 44, 0.12)",
                      }}
                    >
                      {emojis.map(
                        (emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onMouseDown={
                              handleToolbarMouseDown
                            }
                            onClick={() =>
                              insertEmoji(
                                emoji
                              )
                            }
                            style={{
                              border:
                                "none",
                              background:
                                "transparent",
                              borderRadius:
                                "9px",
                              padding:
                                "7px",
                              fontSize:
                                "1.15rem",
                              cursor:
                                "pointer",
                            }}
                          >
                            {emoji}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  title="Insertar imagen"
                  onMouseDown={
                    handleToolbarMouseDown
                  }
                  onClick={
                    openImagePicker
                  }
                  disabled={
                    uploadingImage
                  }
                  style={{
                    ...toolbarButtonStyle,
                    fontSize:
                      "1.02rem",
                    opacity:
                      uploadingImage
                        ? 0.55
                        : 1,
                  }}
                >
                  🖼️
                </button>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                  style={{
                    display: "none",
                  }}
                />

                {uploadingImage && (
                  <span
                    style={{
                      marginLeft:
                        "5px",
                      fontSize:
                        "0.76rem",
                      color:
                        "var(--color-text-secondary)",
                    }}
                  >
                    Subiendo imagen...
                  </span>
                )}
              </div>

              {/* EDITOR */}

              <div
                style={{
                  position:
                    "relative",
                }}
              >
                <div
                  id="message-editor"
                  ref={editorRef}
                  contentEditable={
                    !createdId
                  }
                  suppressContentEditableWarning
                  onInput={updateContent}
                  onClick={
                    handleEditorClick
                  }
                  onKeyUp={
                    saveCurrentSelection
                  }
                  onMouseUp={
                    saveCurrentSelection
                  }
                  onFocus={
                    saveCurrentSelection
                  }
                  style={{
                    width: "100%",
                    minHeight:
                      "270px",
                    boxSizing:
                      "border-box",
                    padding:
                      "16px 15px",
                    border:
                      "1px solid var(--color-border)",
                    borderRadius:
                      "0 0 14px 14px",
                    outline: "none",
                    background:
                      "#FFFFFF",
                    color:
                      "var(--color-text)",
                    fontFamily:
                      activeTypography.fontFamily,
                    fontSize: "1rem",
                    lineHeight:
                      1.7,
                    whiteSpace:
                      "pre-wrap",
                    overflowWrap:
                      "anywhere",
                  }}
                />

                {!contentHtml && (
                  <div
                    style={{
                      position:
                        "absolute",
                      top: "16px",
                      left: "15px",
                      pointerEvents:
                        "none",
                      color:
                        "var(--color-text-muted)",
                      fontFamily:
                        activeTypography.fontFamily,
                      fontSize:
                        "1rem",
                      lineHeight:
                        1.7,
                    }}
                  >
                    Escribe aquí el mensaje que verá la persona...
                  </div>
                )}
              </div>

              {/* IMAGE SIZE CONTROLS */}

              {selectedImage && (
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "8px",
                    flexWrap:
                      "wrap",
                    marginTop:
                      "12px",
                    padding:
                      "10px 12px",
                    border:
                      "1px solid var(--color-border)",
                    borderRadius:
                      "14px",
                    background:
                      "#FBF9F4",
                  }}
                >
                  <span
                    style={{
                      marginRight:
                        "4px",
                      fontSize:
                        "0.74rem",
                      letterSpacing:
                        "0.06em",
                      textTransform:
                        "uppercase",
                      color:
                        "var(--color-text-secondary)",
                    }}
                  >
                    Tamaño de imagen
                  </span>

                  {imageSizes.map(
                    (size) => {
                      const selected =
                        selectedImage.style.width ===
                        size.width;

                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() =>
                            changeImageSize(
                              size.width
                            )
                          }
                          style={{
                            border:
                              selected
                                ? `1px solid ${activeColor.color}`
                                : "1px solid var(--color-border)",
                            borderRadius:
                              "999px",
                            padding:
                              "7px 12px",
                            background:
                              selected
                                ? activeColor.soft
                                : "#FFFFFF",
                            color:
                              selected
                                ? activeColor.color
                                : "var(--color-text)",
                            fontSize:
                              "0.76rem",
                            fontWeight:
                              selected
                                ? 500
                                : 400,
                            cursor:
                              "pointer",
                          }}
                        >
                          {size.label}
                        </button>
                      );
                    }
                  )}
                </div>
              )}

              <p
                style={{
                  margin:
                    "9px 0 0",
                  fontSize:
                    "0.76rem",
                  lineHeight:
                    1.5,
                  color:
                    "var(--color-text-muted)",
                }}
              >
                Puedes dar formato al
                texto, insertar emojis y
                agregar imágenes.
                {selectedImage &&
                  " Selecciona una imagen para cambiar su tamaño."}
              </p>

              {/* ERROR */}

              {error && (
                <div
                  style={{
                    marginTop:
                      "18px",
                    padding:
                      "14px 16px",
                    borderRadius:
                      "14px",
                    background:
                      "#FBF4F1",
                    border:
                      "1px solid #E8D8D1",
                    color:
                      "#765F56",
                    fontSize:
                      "0.88rem",
                    lineHeight:
                      1.5,
                  }}
                >
                  {error}
                </div>
              )}

              {/* SAVE */}

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving ||
                  (!!createdId && !editingCommunicationId) ||
                  loadingCommunication
                }
                style={{
                  width: "100%",
                  minHeight:
                    "50px",
                  marginTop:
                    "24px",
                  border: "none",
                  borderRadius:
                    "999px",
                  background:
                    saving ||
                    (createdId && !editingCommunicationId) ||
                    loadingCommunication
                      ? "#D9D5CC"
                      : "var(--color-primary)",
                  color:
                    "#FFFFFF",
                  fontSize:
                    "0.94rem",
                  fontWeight:
                    500,
                  cursor:
                    saving ||
                    (createdId && !editingCommunicationId) ||
                    loadingCommunication
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {saving
                  ? "Guardando..."
                  : editingCommunicationId
                    ? communicationSaved
                      ? "Cambios guardados ✓"
                      : "Guardar cambios"
                    : editingTemplateId
                      ? templateSaved
                        ? "Plantilla actualizada ✓"
                        : "Guardar cambios"
                      : createdId
                        ? "Comunicación creada"
                        : "Guardar comunicación"}
              </button>

              {editingCommunicationId && communicationSaved && createdId && (
                <Link
                  href={`/message/${createdId}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    minHeight: "48px",
                    marginTop: "12px",
                    padding: "0 24px",
                    borderRadius: "999px",
                    border: "1px solid var(--color-primary)",
                    background: "#FFFFFF",
                    color: "var(--color-primary)",
                    fontSize: "0.94rem",
                    fontWeight: 500,
                    textDecoration: "none",
                    boxSizing: "border-box",
                  }}
                >
                  Ver vista pública ↗
                </Link>
              )}
            </section>

            {/* RIGHT / PREVIEW */}

            <section
              style={{
                background:
                  "#FBF9F4",
                border:
                  "1px solid var(--color-border)",
                borderRadius:
                  "28px",
                padding:
                  "30px",
                position:
                  "sticky",
                top: "24px",
              }}
            >
              <div
                style={{
                  fontSize:
                    "0.76rem",
                  letterSpacing:
                    "0.08em",
                  textTransform:
                    "uppercase",
                  color:
                    "var(--color-text-secondary)",
                }}
              >
                Vista previa
              </div>

              <h2
                style={{
                  margin:
                    "4px 0 22px",
                  fontFamily:
                    "var(--font-display)",
                  fontSize:
                    "1.8rem",
                  fontWeight:
                    500,
                  color:
                    "var(--color-text)",
                }}
              >
                Así lo verá la persona
              </h2>

              {/* MESSAGE CARD — estructura fija; el color solo cambia identidad visual */}

              <div
                style={{
                  background: activeColor.soft,
                  borderRadius: "24px",
                  padding: "16px",
                  transition: "background 0.2s ease",
                }}
              >
                <article
                  style={{
                    width: "100%",
                    background: "#FFFFFF",
                    border: `1px solid ${activeColor.color}30`,
                    borderRadius: "22px",
                    padding: "30px 26px",
                    boxSizing: "border-box",
                    boxShadow: "0 10px 28px rgba(60, 50, 35, 0.05)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.68rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: activeColor.color,
                      textAlign: "center",
                    }}
                  >
                    EVENSSE · COMUNICA
                  </p>

                  <div
                    style={{
                      width: "54px",
                      height: "1px",
                      margin: "24px auto 0",
                      background: activeColor.color,
                    }}
                  />

                  <h3
                    style={{
                      margin: "24px 0 0",
                      fontFamily: activeTypography.fontFamily,
                      fontWeight: 500,
                      fontSize: titleFontSizes[titleSize],
                      lineHeight: 1.12,
                      textAlign: "center",
                      color: activeColor.color,
                    }}
                  >
                    {title || "Título de tu comunicación"}
                  </h3>

                  <div
                    style={{
                      width: "42px",
                      height: "1px",
                      margin: "22px auto",
                      background: activeColor.color,
                      opacity: 0.55,
                    }}
                  />

                  <div
                    style={{
                      fontFamily: activeTypography.fontFamily,
                      fontSize: messageSize === "large" ? "1.08rem" : "1rem",
                      lineHeight: 1.7,
                      color: "var(--color-text)",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {contentHtml ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: contentHtml,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        Aquí aparecerá el contenido de tu mensaje.
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: "30px",
                      paddingTop: "18px",
                      borderTop: `1px solid ${activeColor.color}20`,
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: "0.62rem",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "#99918A",
                      }}
                    >
                      COMUNICA · EVENSSE
                    </span>
                  </div>
                </article>
              </div>

              {/* SELECTED STYLE */}

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: "16px",
                  marginTop:
                    "18px",
                  padding:
                    "14px 16px",
                  borderRadius:
                    "16px",
                  background:
                    "#FFFFFF",
                  border:
                    "1px solid var(--color-border)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize:
                        "0.68rem",
                      letterSpacing:
                        "0.08em",
                      textTransform:
                        "uppercase",
                      color:
                        "var(--color-text-secondary)",
                    }}
                  >
                    Color
                  </div>

                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "7px",
                      marginTop:
                        "5px",
                      fontSize:
                        "0.82rem",
                      fontWeight:
                        500,
                    }}
                  >
                    <span
                      style={{
                        width:
                          "10px",
                        height:
                          "10px",
                        borderRadius:
                          "50%",
                        background:
                          activeColor.color,
                      }}
                    />

                    {activeColor.name}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize:
                        "0.68rem",
                      letterSpacing:
                        "0.08em",
                      textTransform:
                        "uppercase",
                      color:
                        "var(--color-text-secondary)",
                    }}
                  >
                    Tipografía
                  </div>

                  <div
                    style={{
                      marginTop:
                        "5px",
                      fontSize:
                        "0.82rem",
                      fontWeight:
                        500,
                    }}
                  >
                    {
                      activeTypography.name
                    }
                  </div>
                </div>
              </div>

              {/* PUBLIC LINK */}

              {createdId && (
                <div
                  style={{
                    marginTop:
                      "22px",
                    paddingTop:
                      "22px",
                    borderTop:
                      "1px solid var(--color-border)",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize:
                        "0.72rem",
                      letterSpacing:
                        "0.12em",
                      textTransform:
                        "uppercase",
                      color:
                        "var(--color-accent)",
                    }}
                  >
                    Enlace público
                  </p>

                  <h3
                    style={{
                      margin:
                        "7px 0 8px",
                      fontFamily:
                        "var(--font-display)",
                      fontSize:
                        "1.45rem",
                      fontWeight:
                        500,
                      color:
                        "var(--color-text)",
                    }}
                  >
                    Listo para SendPulse
                  </h3>

                  <div
                    style={{
                      display:
                        "flex",
                      gap: "8px",
                      alignItems:
                        "stretch",
                    }}
                  >
                    <input
                      readOnly
                      value={
                        publicUrl
                      }
                      style={{
                        ...inputStyle,
                        marginBottom:
                          0,
                        flex: 1,
                        background:
                          "#FFFFFF",
                        fontSize:
                          "0.78rem",
                      }}
                    />

                    <button
                      type="button"
                      onClick={
                        copyLink
                      }
                      style={{
                        minWidth:
                          "105px",
                        border:
                          "none",
                        borderRadius:
                          "999px",
                        background:
                          activeColor.color,
                        color:
                          "#FFFFFF",
                        fontSize:
                          "0.8rem",
                        fontWeight:
                          500,
                        cursor:
                          "pointer",
                        padding:
                          "0 14px",
                      }}
                    >
                      {copied
                        ? "¡Copiado!"
                        : "Copiar"}
                    </button>
                  </div>

                  <a
                    href={
                      publicUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display:
                        "inline-flex",
                      marginTop:
                        "12px",
                      color:
                        activeColor.color,
                      fontSize:
                        "0.82rem",
                      fontWeight:
                        500,
                      textDecoration:
                        "none",
                    }}
                  >
                    Abrir página pública →
                  </a>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}


export default function NewCommunicationPage() {
  return (
    <Suspense fallback={
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--color-background)",
          color: "var(--color-text-secondary)",
          fontFamily: "var(--font-body)",
        }}
      >
        Cargando...
      </div>
    }>
      <NewCommunicationPageContent />
    </Suspense>
  );
}

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: "9px",
  marginTop: "20px",
  fontSize: "0.76rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--color-text-secondary)",
};

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: "48px",
  boxSizing: "border-box",
  padding: "12px 15px",
  border: "1px solid var(--color-border)",
  borderRadius: "14px",
  outline: "none",
  background: "#FFFFFF",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "0.92rem",
};

const toolbarButtonStyle: CSSProperties = {
  width: "34px",
  height: "34px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--color-border)",
  borderRadius: "9px",
  background: "#FFFFFF",
  color: "var(--color-text)",
  fontSize: "0.92rem",
  cursor: "pointer",
};