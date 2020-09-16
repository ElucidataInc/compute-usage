get_prod_nodes() {
	kubectl get nodes --kubeconfig=./prodconfig
}

get_prod_node_describe() {
	kubectl describe nodes $1 --kubeconfig=./prodconfig
}

get_prod_pods() {
    kubectl get pods -n compute-prod --kubeconfig=./prodconfig
}

echo "{}" > ./final_data.json
echo "" > ./temp_data.txt
get_prod_pods > ./all_pods.txt

SUB_STR=aks-sharedunp
for OUTPUT in $(get_prod_nodes | grep $SUB_STR)
do
	if [[ "$OUTPUT" == *"$SUB_STR"* ]]; then
		get_prod_node_describe $OUTPUT > ./temp_data.txt
  		node extract_data.js $OUTPUT
	fi
done

cat ./final_data.json
