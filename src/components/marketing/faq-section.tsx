import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { getFaqItems } from "@/config/faq"

export function FaqSection() {
  const items = getFaqItems()

  return (
    <section id="preguntas-frecuentes" className="scroll-mt-24 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-primary">Preguntas frecuentes</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Preguntas claras. Respuestas concretas.
        </h2>
        <Accordion type="single" collapsible className="mt-8" defaultValue="item-0">
          {items.map((item, index) => (
            <AccordionItem key={item.question} value={`item-${index}`}>
              <AccordionTrigger className="font-heading py-4 text-left text-base min-h-11">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-[#5b6b82] leading-6">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
