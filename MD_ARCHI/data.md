\# data.md



\## Tables principales



\### membres

\- idmembre

\- nom

\- prenom

\- emailmembre

\- emailvalid

\- dateemailvalid



\### majemailmembre

\- idmaj

\- idmembre

\- emailmembre

\- dateemailvalid



\### regleclub

\- idmembre

\- v1

\- datevalidv1

\- v2

\- datevalidv2



\### regleapp

\- idmembre

\- v1

\- datevalidv1

\- v2

\- datevalidv2



\### parrain

\- idmembre

\- emailparrain

\- datemaj



\### majparrain

\- idmaj

\- idmembre

\- emailparrain

\- datemaj













\### parks

\- id

\- name

\- city

\- gps\_lat

\- gps\_lng

\- status



\### sessions

\- id

\- park\_id

\- title

\- date

\- capacity

\- status



\### bookings

\- id

\- user\_id

\- session\_id

\- status

\- created\_at



\## Statuts



\### user.role

\- invited\_member

\- coach

\- park\_owner

\- admin



\### booking.status

\- pending

\- confirmed

\- cancelled

