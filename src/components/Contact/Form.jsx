import React, { useState } from "react";
import { useTranslations } from "../../i18n/utils";

function Form({ lang }) {
  const t = useTranslations(lang);
  const [form, setForm] = useState({
    name: "",
    telephone: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Enviando...");
    try {
      const res = await fetch("https://prometheustij.com/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("¡Mensaje enviado!");
        setForm({
          name: "",
          telephone: "",
          email: "",
          message: "",
        });
      } else {
        setStatus("Error al enviar.");
        console.error("Error response:" + res.statusText);
      }
    } catch (err) {
      setStatus("Error de conexión.");
    }
  };

  return (
    <section className="flex flex-col items-center justify-center my-16 md:my-20 lg:my-26">
      <div className="max-w-[750px] w-full mx-auto px-4">
        <form
          className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 w-full"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col mb-4 col-span-2 lg:col-span-1">
            <div className="flex mb-2 text-sm md:text-2xl font-semibold gap-1">
              <label htmlFor="name" className="text-texto w-max">
                {t("contact.form.p1")}
              </label>
              <p className="text-principal">*</p>
            </div>
            <input
              type="text"
              name="name"
              id="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              className="bg-white border border-gray-300 text-sm md:text-xl text-neutral-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-principal focus:ease-in-out focus:duration-300"
              required
            />
          </div>
          <div className="flex flex-col mb-4 col-span-2 lg:col-span-1">
            <label
              htmlFor="telephone"
              className="mb-2 text-sm md:text-2xl font-semibold text-texto w-max"
            >
              {t("contact.form.p2")}
            </label>
            <input
              type="tel"
              name="telephone"
              id="telephone"
              value={form.telephone}
              onChange={handleChange}
              pattern="^\+?[0-9]{1,3}?[- ]?\(?[0-9]{3}\)?[- ]?[0-9]{3}[- ]?[0-9]{4}$"
              placeholder="+1 (619) 123 4567"
              className="bg-white border border-gray-300 text-sm md:text-xl text-neutral-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-principal focus:ease-in-out focus:duration-300"
            />
          </div>
          <div className="flex flex-col mb-4 col-span-2">
            <div className="flex mb-2 text-sm md:text-2xl font-semibold gap-1">
              <label htmlFor="email" className="text-texto w-max">
                {t("contact.form.p3")}
              </label>
              <p className="text-principal">*</p>
            </div>
            <input
              type="email"
              name="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              placeholder="janedoe@email.com"
              className="bg-white border border-gray-300 text-sm md:text-xl text-neutral-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-principal"
              required
            />
          </div>
          <div className="flex flex-col mb-4 col-span-2">
            <div className="flex mb-2 text-sm md:text-2xl font-semibold gap-1">
              <label htmlFor="message" className="text-texto w-max">
                {t("contact.form.p4")}
              </label>
              <p className="text-principal">*</p>
            </div>
            <textarea
              name="message"
              id="message"
              value={form.message}
              onChange={handleChange}
              className="bg-white border border-gray-300 text-sm md:text-xl text-neutral-600 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-principal h-[174px]"
              required
              placeholder={t("contact.form.placeholder")}
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-principal md:text-2xl font-semibold col-span-2 text-white rounded-xl p-3 md:py-5 mt-8 transition-opacity duration-300"
          >
            {t("contact.form.button")}
          </button>
        </form>
        {status && <div className="mt-4">{status}</div>}
      </div>
    </section>
  );
}

export default Form;
