/* Automatically generated nanopb header */
/* Generated by nanopb-0.3.9.3 at Tue Mar 19 10:23:01 2019. */

#ifndef PB_SIMPLE_PB_H_INCLUDED
#define PB_SIMPLE_PB_H_INCLUDED
#include <pb.h>

/* @@protoc_insertion_point(includes) */
#if PB_PROTO_HEADER_VERSION != 30
#error Regenerate this file with the current version of nanopb generator.
#endif

#ifdef __cplusplus
extern "C" {
#endif

/* Struct definitions */
typedef struct _SimpleMessage {
    int32_t on_time;
    int32_t off_time;
/* @@protoc_insertion_point(struct:SimpleMessage) */
} SimpleMessage;

/* Default values for struct fields */

/* Initializer values for message structs */
#define SimpleMessage_init_default               {0, 0}
#define SimpleMessage_init_zero                  {0, 0}

/* Field tags (for use in manual encoding/decoding) */
#define SimpleMessage_on_time_tag                1
#define SimpleMessage_off_time_tag               2

/* Struct field encoding specification for nanopb */
extern const pb_field_t SimpleMessage_fields[3];

/* Maximum encoded size of messages (where known) */
#define SimpleMessage_size                       22

/* Message IDs (where set with "msgid" option) */
#ifdef PB_MSGID

#define SIMPLE_MESSAGES \


#endif

#ifdef __cplusplus
} /* extern "C" */
#endif
/* @@protoc_insertion_point(eof) */

#endif
