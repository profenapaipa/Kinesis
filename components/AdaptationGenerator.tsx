"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEARNING_STYLE_LABEL, generateAdaptationsForPlan } from "@/lib/adaptationEngine";
import { getSubject } from "@/lib/subjects";
import type { LessonPlan, Student } from "@/types";

interface AdaptationGeneratorProps {
  plans: LessonPlan[];
  students: Student[];
}

export function AdaptationGenerator({ plans, students }: AdaptationGeneratorProps) {
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id);
  const plan = plans.find((item) => item.id === selectedPlanId) ?? plans[0];
  const subject = getSubject(plan.subject);
  const Icon = subject.icon;

  const adaptations = useMemo(
    () => generateAdaptationsForPlan(plan, students),
    [plan, students]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold">Generador de adaptaciones PIAR</h2>
          <p className="text-sm text-muted-foreground">
            Cruce automático entre la planeación seleccionada y los estudiantes
            con PIAR de tu curso.
          </p>
        </div>

        <Select
          value={selectedPlanId}
          onValueChange={(value) => {
            if (value) setSelectedPlanId(value);
          }}
        >
          <SelectTrigger className="w-full sm:w-72">
            <SelectValue placeholder="Selecciona una planeación" />
          </SelectTrigger>
          <SelectContent>
            {plans.map((item) => {
              const itemSubject = getSubject(item.subject);
              return (
                <SelectItem key={item.id} value={item.id}>
                  {itemSubject.shortName} · {item.grade} — {item.topic}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Lado izquierdo: planeación general */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Planeación general
          </h3>
          <ScrollArea className="h-128 rounded-xl ring-1 ring-foreground/10 md:h-[calc(100vh-18rem)]">
            <Card className="rounded-none ring-0">
              <CardHeader>
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className="flex size-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${subject.color}1a`, color: subject.color }}
                  >
                    <Icon className="size-4" />
                  </span>
                  <Badge variant="outline">{subject.shortName}</Badge>
                </div>
                <CardTitle>{plan.topic}</CardTitle>
                <CardDescription>
                  {plan.grade} · {plan.date}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <p className="text-sm font-medium">Objetivo</p>
                  <p className="text-sm text-muted-foreground">{plan.objective}</p>
                </div>

                <Separator />

                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium">Actividades</p>
                  {plan.activities.map((activity, index) => (
                    <div key={activity.id} className="flex flex-col gap-0.5">
                      <p className="text-sm font-medium">
                        {index + 1}. {activity.title}{" "}
                        <span className="font-normal text-muted-foreground">
                          ({activity.durationMinutes} min)
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium">Recursos generales</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {plan.resources.map((resource) => (
                      <Badge key={resource} variant="outline">
                        {resource}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Evaluación</p>
                  <p className="text-sm text-muted-foreground">
                    {plan.evaluationMethod}
                  </p>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </div>

        {/* Lado derecho: adaptaciones por estudiante PIAR */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Adaptaciones por estudiante ({adaptations.length})
          </h3>
          <ScrollArea className="h-128 rounded-xl md:h-[calc(100vh-18rem)]">
            <div className="flex flex-col gap-4 pr-3">
              {adaptations.length === 0 && (
                <Card className="items-center py-10 text-center">
                  <CardContent className="text-sm text-muted-foreground">
                    No hay estudiantes con PIAR registrados para cruzar con esta
                    planeación.
                  </CardContent>
                </Card>
              )}
              {adaptations.map(({ student, adaptedActivities, generalRecommendations }) => (
                <Card key={student.id} className="ring-1 ring-amber-500/40">
                  <CardHeader className="flex-row items-start justify-between gap-2">
                    <div>
                      <CardTitle>{student.fullName}</CardTitle>
                      <CardDescription>
                        {student.grade} · {student.group}
                      </CardDescription>
                    </div>
                    <Badge className="bg-amber-500 text-white dark:bg-amber-600">
                      PIAR
                    </Badge>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                      <span>{student.piarProfile?.diagnosis}</span>
                      {student.piarProfile && (
                        <Badge variant="outline" className="border-primary/40 text-primary">
                          Aprende mejor: {LEARNING_STYLE_LABEL[student.piarProfile.learningStyle]}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      {adaptedActivities.map((adapted, index) => {
                        const original = plan.activities.find(
                          (activity) => activity.id === adapted.originalActivityId
                        );
                        return (
                          <div
                            key={adapted.originalActivityId}
                            className="flex flex-col gap-1.5 rounded-lg bg-muted/50 p-3"
                          >
                            <p className="text-sm font-medium">
                              {index + 1}. {original?.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {adapted.adaptationDescription}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {adapted.specificResources.map((resource) => (
                                <Badge key={resource} variant="secondary">
                                  {resource}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm font-medium">
                        Recomendaciones generales
                      </p>
                      <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                        {generalRecommendations.map((recommendation) => (
                          <li key={recommendation}>{recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
