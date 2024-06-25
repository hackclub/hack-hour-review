"use server";

export default async function getData(id) {
  const res = await fetch(`/api/scrapbook/${id}`);
  const scrap = await res.json();
  return scrap;
}
